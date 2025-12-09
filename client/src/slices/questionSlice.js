import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";
import { db, auth } from "../config/firebase";
import {
  uploadCSVToCloudinary,
  uploadMultipleToCloudinary,
} from "../config/cloudinaryUpload";


export const uploadCSVQuestions = createAsyncThunk(
  "questions/uploadCSVQuestions",
  async (
    {
      testName,
      title,
      instructions,
      makeTime,
      testType,
      csvFile,
      questions,
      uploadedViaAI,
      categoryId,
      categoryName,
      subject,
      subcategory,
    },
    { rejectWithValue }
  ) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error("User not authenticated");

      if (!categoryId || !categoryName || !subject) {
        throw new Error("Category and subject are required");
      }

      let parsedQuestions = [];
      let csvUrl = null;
      let csvPublicId = null;

      if (uploadedViaAI && questions) {
        parsedQuestions = questions.map((q) => ({
          questionText: q.questionText,
          options: [q.optionA, q.optionB, q.optionC, q.optionD].filter(Boolean),
          images: q.images || [],
          correctAnswer: q.correctAnswer,
          questionLevel: q.questionLevel || "Medium",
          explanation: q.explanation || null, 
        }));
      } else {
        if (!csvFile) {
          throw new Error("CSV file is required");
        }

        const uploadResult = await uploadCSVToCloudinary(csvFile);
        csvUrl = uploadResult.url;
        csvPublicId = uploadResult.publicId;

        const csvText = await csvFile.text();
        const lines = csvText.split("\n");
        const headers = lines[0].split(",").map(h => h.trim().toLowerCase());

        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;

          const values = lines[i].split(",");
          const row = {};
          headers.forEach((header, index) => {
            row[header] = values[index]?.trim();
          });

          const images = row.images
            ? row.images.split(";").map((img) => img.trim())
            : [];

          const explanation = 
            row.explanation || 
            row.solution || 
            row.answer_explanation ||
            row.explanation_text ||
            null;

          parsedQuestions.push({
            questionText: row.questiontext,
            options: [row.optiona, row.optionb, row.optionc, row.optiond].filter(
              Boolean
            ),
            images,
            correctAnswer: row.correctanswer,
            questionLevel: row.questionlevel || "Medium",
            explanation: explanation, 
          });
        }
      }

      const questionSetData = {
        testName,
        title,
        instructions,
        testType,
        makeTime: Number(makeTime),
        questions: parsedQuestions,
        categoryId,
        categoryName,
        subject,
        subcategory: subcategory || null,
        createdBy: userId,
        uploadedViaAI: uploadedViaAI || false,
        ...(csvUrl && { csvFileUrl: csvUrl }),
        ...(csvPublicId && { csvPublicId }),
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "questions"), questionSetData);

      return {
        success: true,
        message: uploadedViaAI
          ? "AI-parsed questions uploaded successfully"
          : "Questions uploaded successfully",
        cloudinaryFile: csvUrl,
        data: {
          id: docRef.id,
          ...questionSetData,
        },
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


export const uploadAIParsedQuestions = createAsyncThunk(
  "questions/uploadAIParsedQuestions",
  async (
    {
      testName,
      title,
      instructions,
      makeTime,
      testType,
      questions,
      originalFileName,
      categoryId,
      categoryName,
      subject,
      subcategory,
    },
    { rejectWithValue }
  ) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error("User not authenticated");

      if (!questions || questions.length === 0) {
        throw new Error("No questions provided");
      }

      if (!categoryId || !categoryName || !subject) {
        throw new Error("Category and subject are required");
      }

      const formattedQuestions = questions.map((q) => ({
        questionText: q.questionText,
        options: [q.optionA, q.optionB, q.optionC, q.optionD].filter(Boolean),
        images: q.images || [],
        correctAnswer: q.correctAnswer,
        questionLevel: q.questionLevel || "Medium",
        explanation: q.explanation || null, 
      }));

      const questionSetData = {
        testName,
        title,
        instructions,
        testType,
        makeTime: Number(makeTime),
        questions: formattedQuestions,
        categoryId,
        categoryName,
        subject,
        subcategory: subcategory || null,
        createdBy: userId,
        uploadedViaAI: true,
        originalFileName,
        totalQuestions: formattedQuestions.length,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "questions"), questionSetData);

      return {
        success: true,
        message: `Successfully uploaded ${formattedQuestions.length} AI-parsed questions`,
        data: {
          id: docRef.id,
          ...questionSetData,
        },
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


export const updateSingleQuestion = createAsyncThunk(
  "questions/updateSingleQuestion",
  async ({ testId, questionIndex, updates }, { rejectWithValue }) => {
    try {
      const testRef = doc(db, "questions", testId);
      const testDoc = await getDoc(testRef);

      if (!testDoc.exists()) {
        throw new Error("Test not found");
      }

      const testData = testDoc.data();
      const questions = testData.questions || [];

      if (questionIndex < 0 || questionIndex >= questions.length) {
        throw new Error("Question not found");
      }

      questions[questionIndex] = {
        ...questions[questionIndex],
        ...updates,
      };

      await updateDoc(testRef, { questions });

      return {
        success: true,
        message: "Question updated successfully",
        data: questions[questionIndex],
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


export const addQuestionImages = createAsyncThunk(
  "questions/addQuestionImages",
  async ({ testId, questionIndex, imageFiles }, { rejectWithValue }) => {
    try {
      console.log("RAW FORMDATA:", Array.from(imageFiles.entries()));
      const filesArray = imageFiles.getAll("file");
      console.log("FILES ARRAY:", filesArray);

      if (!filesArray || filesArray.length === 0) {
        throw new Error("No image files provided");
      }

      const testRef = doc(db, "questions", testId);
      const testDoc = await getDoc(testRef);

      if (!testDoc.exists()) throw new Error("Test not found");

      const testData = testDoc.data();
      const questions = testData.questions || [];

      if (questionIndex < 0 || questionIndex >= questions.length) {
        throw new Error("Question not found");
      }

      const uploadResults = await uploadMultipleToCloudinary(filesArray, {
        folder: "questionImages",
        resourceType: "image",
      });

      console.log("CLOUDINARY RESULTS:", uploadResults);

      const imageUrls = uploadResults.map((r) => r.url);

      questions[questionIndex].images = [
        ...(questions[questionIndex].images || []),
        ...imageUrls,
      ];

      await updateDoc(testRef, { questions });

      return {
        success: true,
        message: "Images added successfully",
        data: questions[questionIndex],
      };
    } catch (error) {
      console.log("Error adding question images:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const deleteQuestionImage = createAsyncThunk(
  "questions/deleteQuestionImage",
  async ({ testId, questionIndex, imageIndex }, { rejectWithValue }) => {
    try {
      const testRef = doc(db, "questions", testId);
      const testDoc = await getDoc(testRef);

      if (!testDoc.exists()) {
        throw new Error("Test not found");
      }

      const testData = testDoc.data();
      const questions = testData.questions || [];

      if (questionIndex < 0 || questionIndex >= questions.length) {
        throw new Error("Question not found");
      }

      const question = questions[questionIndex];
      if (
        !question.images ||
        imageIndex < 0 ||
        imageIndex >= question.images.length
      ) {
        throw new Error("Image not found");
      }

      question.images.splice(imageIndex, 1);
      questions[questionIndex] = question;

      await updateDoc(testRef, { questions });

      return {
        success: true,
        message: "Image deleted successfully",
        data: {
          testId,
          questionIndex,
          imageIndex,
          updatedQuestion: question,
        },
      };
    } catch (error) {
      console.error("Error deleting question image:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const deleteQuestion = createAsyncThunk(
  "questions/deleteQuestion",
  async ({ testId, questionIndex }, { rejectWithValue }) => {
    try {
      const testRef = doc(db, "questions", testId);
      const testDoc = await getDoc(testRef);

      if (!testDoc.exists()) {
        throw new Error("Test not found");
      }

      const testData = testDoc.data();
      const questions = testData.questions || [];

      if (questionIndex < 0 || questionIndex >= questions.length) {
        throw new Error("Question not found");
      }

      questions.splice(questionIndex, 1);

      await updateDoc(testRef, { questions });

      return {
        success: true,
        message: "Question deleted successfully",
        data: {
          testId,
          questionIndex,
          remainingQuestions: questions.length,
        },
      };
    } catch (error) {
      console.error("Error deleting question:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const deleteQuestionPaper = createAsyncThunk(
  "questions/deleteQuestionPaper",
  async (testId, { rejectWithValue }) => {
    try {
      const testRef = doc(db, "questions", testId);
      const testDoc = await getDoc(testRef);

      if (!testDoc.exists()) {
        throw new Error("Test not found");
      }

      await deleteDoc(testRef);

      return {
        success: true,
        message: "Question paper deleted successfully",
        data: { testId },
      };
    } catch (error) {
      console.error("Error deleting question paper:", error);
      return rejectWithValue(error.message);
    }
  }
);


export const getAllQuestionPapersByCreator = createAsyncThunk(
  "questions/getAllQuestionPapersByCreator",
  async (_, { rejectWithValue }) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error("User not authenticated");

      const questionsRef = collection(db, "questions");
      const q = query(
        questionsRef,
        where("createdBy", "==", userId),  // ✅ Filters by current user
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return {
          success: false,
          message: "No question papers found for this creator",
          data: [],
        };
      }

      const papers = [];
      querySnapshot.forEach((doc) => {
        papers.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return {
        success: true,
        count: papers.length,
        data: papers,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getAllQuestionPapers = createAsyncThunk(
  "questions/getAllQuestionPapers",
  async (filterByCreator = true, { rejectWithValue }) => {
    try {
      const questionsRef = collection(db, "questions");
      let q;

      if (filterByCreator) {
        const userId = auth.currentUser?.uid;
        if (!userId) throw new Error("User not authenticated");
        
        // Filter by current user
        q = query(
          questionsRef,
          where("createdBy", "==", userId),
          orderBy("createdAt", "desc")
        );
      } else {
        // Get all (for superadmin only)
        q = query(questionsRef, orderBy("createdAt", "desc"));
      }

      const querySnapshot = await getDocs(q);

      const papers = [];
      querySnapshot.forEach((doc) => {
        papers.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return {
        success: true,
        data: papers,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getPapersByType = createAsyncThunk(
  "questions/getPapersByType",
  async ({ testType, filterByCreator = true }, { rejectWithValue }) => {
    try {
      const userId = auth.currentUser?.uid;
      const questionsRef = collection(db, "questions");
      let q;

      if (filterByCreator && userId) {
        // Filter by type AND creator
        q = query(
          questionsRef,
          where("testType", "==", testType),
          where("createdBy", "==", userId),
          orderBy("createdAt", "desc")
        );
      } else {
        // Filter by type only (for superadmin or public view)
        q = query(
          questionsRef,
          where("testType", "==", testType),
          orderBy("createdAt", "desc")
        );
      }

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return {
          success: false,
          message: `No question papers found for type: ${testType}`,
          data: [],
        };
      }

      const papers = [];
      for (const docSnapshot of querySnapshot.docs) {
        const paper = docSnapshot.data();
        let creatorData = null;

        if (paper.createdBy) {
          const userDoc = await getDoc(doc(db, "users", paper.createdBy));
          if (userDoc.exists()) {
            creatorData = {
              name: userDoc.data().name,
              email: userDoc.data().email,
            };
          }
        }

        papers.push({
          id: docSnapshot.id,
          testName: paper.testName,
          title: paper.title,
          instructions: paper.instructions,
          testType: paper.testType,
          makeTime: paper.makeTime,
          categoryId: paper.categoryId,
          categoryName: paper.categoryName,
          subject: paper.subject,
          subcategory: paper.subcategory || null,
          createdBy: creatorData,
          createdAt: paper.createdAt?.toDate(),
          totalQuestions: paper.questions?.length || 0,
          questions: paper.questions,
        });
      }

      return {
        success: true,
        count: papers.length,
        data: papers,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getPapersByCategory = createAsyncThunk(
  "questions/getPapersByCategory",
  async ({ categoryId, filterByCreator = true }, { rejectWithValue }) => {
    try {
      const userId = auth.currentUser?.uid;
      const questionsRef = collection(db, "questions");
      let q;

      if (filterByCreator && userId) {
        q = query(
          questionsRef,
          where("categoryId", "==", categoryId),
          where("createdBy", "==", userId),
          orderBy("createdAt", "desc")
        );
      } else {
        q = query(
          questionsRef,
          where("categoryId", "==", categoryId),
          orderBy("createdAt", "desc")
        );
      }

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return {
          success: false,
          message: "No question papers found for this category",
          data: [],
        };
      }

      const papers = [];
      querySnapshot.forEach((doc) => {
        papers.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return {
        success: true,
        count: papers.length,
        data: papers,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getPapersBySubject = createAsyncThunk(
  "questions/getPapersBySubject",
  async ({ categoryId, subject, filterByCreator = true }, { rejectWithValue }) => {
    try {
      const userId = auth.currentUser?.uid;
      const questionsRef = collection(db, "questions");
      let q;

      if (filterByCreator && userId) {
        q = query(
          questionsRef,
          where("categoryId", "==", categoryId),
          where("subject", "==", subject),
          where("createdBy", "==", userId),
          orderBy("createdAt", "desc")
        );
      } else {
        q = query(
          questionsRef,
          where("categoryId", "==", categoryId),
          where("subject", "==", subject),
          orderBy("createdAt", "desc")
        );
      }

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return {
          success: false,
          message: "No question papers found for this subject",
          data: [],
        };
      }

      const papers = [];
      querySnapshot.forEach((doc) => {
        papers.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return {
        success: true,
        count: papers.length,
        data: papers,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getPapersBySubcategory = createAsyncThunk(
  "questions/getPapersBySubcategory",
  async ({ categoryId, subject, subcategory, filterByCreator = true }, { rejectWithValue }) => {
    try {
      const userId = auth.currentUser?.uid;
      const questionsRef = collection(db, "questions");
      let q;

      if (filterByCreator && userId) {
        q = query(
          questionsRef,
          where("categoryId", "==", categoryId),
          where("subject", "==", subject),
          where("subcategory", "==", subcategory),
          where("createdBy", "==", userId),
          orderBy("createdAt", "desc")
        );
      } else {
        q = query(
          questionsRef,
          where("categoryId", "==", categoryId),
          where("subject", "==", subject),
          where("subcategory", "==", subcategory),
          orderBy("createdAt", "desc")
        );
      }

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return {
          success: false,
          message: "No question papers found for this subcategory",
          data: [],
        };
      }

      const papers = [];
      querySnapshot.forEach((doc) => {
        papers.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return {
        success: true,
        count: papers.length,
        data: papers,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Add this to the END of your questionSlice.js extraReducers

const questionSlice = createSlice({
  name: "questions",
  initialState: {
    papers: [],
    selectedPaper: null,
    loading: false,
    uploadProgress: 0,
    error: null,
  },
  reducers: {
    clearSelectedPaper: (state) => {
      state.selectedPaper = null;
    },
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    // ✅ Add this to manually clear papers when switching users
    clearPapers: (state) => {
      state.papers = [];
      state.selectedPaper = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadCSVQuestions.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.uploadProgress = 0;
      })
      .addCase(uploadCSVQuestions.fulfilled, (state, action) => {
        state.loading = false;
        state.uploadProgress = 100;
        state.papers.unshift(action.payload.data);
      })
      .addCase(uploadCSVQuestions.rejected, (state, action) => {
        state.loading = false;
        state.uploadProgress = 0;
        state.error = action.payload;
      })
      
      // ✅ CRITICAL: Handle getAllQuestionPapersByCreator separately
      .addCase(getAllQuestionPapersByCreator.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllQuestionPapersByCreator.fulfilled, (state, action) => {
        state.loading = false;
        // ✅ Replace papers with creator-specific data
        state.papers = action.payload.data || [];
        console.log("✅ Redux: Set papers for creator:", action.payload.data?.length || 0);
      })
      .addCase(getAllQuestionPapersByCreator.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.papers = []; // ✅ Clear papers on error
      })
      
      .addCase(getAllQuestionPapers.fulfilled, (state, action) => {
        state.papers = action.payload.data;
      })
      .addCase(getPapersByType.fulfilled, (state, action) => {
        state.papers = action.payload.data;
      })
      .addCase(getPapersByCategory.fulfilled, (state, action) => {
        state.papers = action.payload.data;
      })
      .addCase(getPapersBySubject.fulfilled, (state, action) => {
        state.papers = action.payload.data;
      })
      .addCase(getPapersBySubcategory.fulfilled, (state, action) => {
        state.papers = action.payload.data;
      })
      .addCase(deleteQuestionImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteQuestionImage.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteQuestionImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteQuestion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteQuestion.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteQuestion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteQuestionPaper.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteQuestionPaper.fulfilled, (state, action) => {
        state.loading = false;
        state.papers = state.papers.filter(
          (paper) => paper.id !== action.payload.data.testId
        );
      })
      .addCase(deleteQuestionPaper.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSelectedPaper, setUploadProgress, setLoading, clearPapers } =
  questionSlice.actions;
export default questionSlice.reducer;