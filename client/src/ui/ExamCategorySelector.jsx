import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { GraduationCap, Beaker, Zap, BookOpen, Target, ChevronRight } from "lucide-react";
import { getAllCategories } from "../slices/categorySlice";

const ExamCategorySelector = ({ onCategorySelect }) => {
  const dispatch = useDispatch();
  const { categories, loading } = useSelector((state) => state.category);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

  useEffect(() => {
    dispatch(getAllCategories());
  }, [dispatch]);

  
  const getIconComponent = (iconName) => {
    const icons = {
      GraduationCap,
      Beaker,
      Zap,
      BookOpen,
      Target,
    };
    return icons[iconName] || BookOpen;
  };

  
  const getColorScheme = (type) => {
    const schemes = {
      Competitive: {
        color: "from-emerald-400 to-teal-500",
        bgColor: "bg-emerald-500/10",
        borderColor: "border-emerald-500/20",
      },
      School: {
        color: "from-blue-400 to-indigo-500",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/20",
      },
      Quiz: {
        color: "from-orange-400 to-red-500",
        bgColor: "bg-orange-500/10",
        borderColor: "border-orange-500/20",
      },
    };
    return schemes[type] || schemes.Competitive;
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setSelectedSubject(null);
    setSelectedSubcategory(null);
    
    
    if (category.subjects && category.subjects.length > 0) {
      const firstSubject = category.subjects[0];
      setSelectedSubject(firstSubject);
      
      
      if (onCategorySelect) {
        onCategorySelect(category, firstSubject.name, null);
      }
    } else {
      if (onCategorySelect) {
        onCategorySelect(category, null, null);
      }
    }
  };

  const handleSubjectClick = (subject) => {
    setSelectedSubject(subject);
    setSelectedSubcategory(null);
    
    if (onCategorySelect && selectedCategory) {
      
      onCategorySelect(selectedCategory, subject.name, null);
    }
  };

  const handleSubcategoryClick = (subcategory) => {
    setSelectedSubcategory(subcategory);
    
    if (onCategorySelect && selectedCategory && selectedSubject) {
      
      onCategorySelect(selectedCategory, selectedSubject.name, subcategory);
    }
  };

  if (loading && categories.length === 0) {
    return (
      <div className="space-y-12">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading categories...</p>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="space-y-12">
        <div className="text-center py-8 bg-white/5 rounded-2xl border border-white/10">
          <BookOpen className="mx-auto mb-2 text-gray-500" size={48} />
          <p className="text-gray-500">No categories available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
    
      <div>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <GraduationCap className="text-emerald-400" size={28} />
          Choose Your Exam
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => {
            const Icon = getIconComponent(category.icon);
            const colorScheme = getColorScheme(category.type);
            const isSelected = selectedCategory?.id === category.id;

            return (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleCategoryClick(category)}
                className={`group relative bg-[#0A0A0A]/80 backdrop-blur-xl border rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] ${
                  isSelected
                    ? `${colorScheme.borderColor} shadow-lg`
                    : "border-white/5 hover:border-emerald-500/30"
                }`}
              >
                <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />

                <div className="relative flex flex-col items-center text-center space-y-3">
                  <div
                    className={`w-16 h-16 rounded-xl ${colorScheme.bgColor} border ${colorScheme.borderColor} flex items-center justify-center transition-transform group-hover:scale-110`}
                  >
                    <Icon className="w-8 h-8 text-emerald-400" />
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {category.name}
                  </h3>

                  <span className="text-xs text-gray-400 font-medium">
                    {category.type}
                  </span>

                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-linear-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center"
                    >
                      <svg
                        className="w-4 h-4 text-black"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </motion.div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
      {selectedCategory &&
        selectedCategory.subjects &&
        selectedCategory.subjects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <BookOpen className="text-emerald-400" size={28} />
              Select Subject
            </h2>

            <div className="flex flex-wrap gap-4">
              {selectedCategory.subjects.map((subject, index) => (
                <button
                  key={subject.name || index}
                  onClick={() => handleSubjectClick(subject)}
                  className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 border backdrop-blur-md ${
                    selectedSubject?.name === subject?.name
                      ? "bg-linear-to-r from-emerald-400 to-teal-500 text-black border-transparent shadow-[0_0_15px_rgba(52,211,153,0.3)]"
                      : "bg-white/5 border-white/10 text-gray-400 hover:border-emerald-500/50 hover:text-white"
                  }`}
                >
                  {subject.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}

      {selectedSubject &&
        selectedSubject.subcategories &&
        selectedSubject.subcategories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <ChevronRight className="text-emerald-400" size={28} />
              Select Topic
            </h2>

            <div className="flex flex-wrap gap-3">
              {selectedSubject.subcategories.map((subcategory, index) => (
                <button
                  key={index}
                  onClick={() => handleSubcategoryClick(subcategory)}
                  className={`px-5 py-2.5 rounded-lg font-medium text-xs transition-all duration-300 border backdrop-blur-md ${
                    selectedSubcategory === subcategory
                      ? "bg-linear-to-r from-teal-400 to-cyan-500 text-black border-transparent shadow-[0_0_12px_rgba(20,184,166,0.3)]"
                      : "bg-white/5 border-white/10 text-gray-400 hover:border-teal-500/50 hover:text-white"
                  }`}
                >
                  {subcategory}
                </button>
              ))}
            </div>
          </motion.div>
        )}
    </div>
  );
};

export default ExamCategorySelector;