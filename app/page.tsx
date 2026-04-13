"use client";

import { useState } from "react";
import Flashcard from "@/components/Flashcard";
import { flashcards } from "@/lib/data";
import { ChevronLeft, ChevronRight, Shuffle, Languages } from "lucide-react";

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startLanguage, setStartLanguage] = useState<"english" | "portuguese">("english");
  const [cards, setCards] = useState(flashcards);

  const currentCard = cards[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleShuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
  };

  const toggleLanguage = () => {
    setStartLanguage((prev) => (prev === "english" ? "portuguese" : "english"));
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 font-sans">
      <div className="w-full max-w-2xl flex flex-col items-center space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Language Flashcards</h1>
          <p className="text-gray-500">Practice your English and Portuguese</p>
        </div>

        {/* Controls Top */}
        <div className="flex items-center space-x-4 bg-white p-2 rounded-full shadow-sm border border-gray-100">
          <button
            onClick={toggleLanguage}
            className="flex items-center space-x-2 px-4 py-2 rounded-full hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
          >
            <Languages className="w-4 h-4 text-blue-600" />
            <span>
              {startLanguage === "english" ? "EN → PT" : "PT → EN"}
            </span>
          </button>
          <div className="w-px h-6 bg-gray-200" />
          <button
            onClick={handleShuffle}
            className="flex items-center space-x-2 px-4 py-2 rounded-full hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
          >
            <Shuffle className="w-4 h-4 text-blue-600" />
            <span>Shuffle</span>
          </button>
        </div>

        {/* Flashcard Container */}
        <div className="w-full flex justify-center perspective-1000">
          <Flashcard
            key={currentCard.id + startLanguage} // Force re-render on language change or card change to reset flip state
            english={currentCard.english}
            portuguese={currentCard.portuguese}
            imageKeyword={currentCard.imageKeyword}
            startLanguage={startLanguage}
          />
        </div>

        {/* Controls Bottom */}
        <div className="flex items-center justify-between w-full max-w-md px-4">
          <button
            onClick={handlePrev}
            className="p-3 rounded-full bg-white shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors text-gray-700"
            aria-label="Previous card"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <span className="text-sm font-medium text-gray-500">
            {currentIndex + 1} / {cards.length}
          </span>

          <button
            onClick={handleNext}
            className="p-3 rounded-full bg-white shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors text-gray-700"
            aria-label="Next card"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

      </div>
    </main>
  );
}
