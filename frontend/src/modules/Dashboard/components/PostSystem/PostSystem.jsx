import React, { useState } from 'react';
import PostBox from './PostBox';
import PostModal from './PostModal';

const PostSystem = ({ userData, onPostCreated, aiHighlightComposerEnabled = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeType, setActiveType] = useState('POST');

  const handleOpenModal = (type) => {
    setActiveType(type);
    setIsOpen(true);
  };

  return (
    <>
      {/* 1. PostBox: Jahan se modal khulta hy */}
      <PostBox 
        userData={userData} 
        onOpenModal={handleOpenModal} 
      />

      {/* 2. PostModal: Jahan post likhi jati hy */}
      <PostModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        type={activeType}
        userData={userData}
        aiHighlightComposerEnabled={aiHighlightComposerEnabled}
        onSuccess={() => {
          setIsOpen(false);
          if (onPostCreated) onPostCreated();
        }}
      />
    </>
  );
};

export default PostSystem;