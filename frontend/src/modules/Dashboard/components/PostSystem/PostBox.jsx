import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiEdit3, FiUsers, FiSettings, FiAward,
  FiImage, FiVideo, FiFileText,
} from 'react-icons/fi';
import { BusinessIcon, BUSINESS_LOTTIE } from '../../../../components/lottie';
import PostComposerAvatar from './PostComposerAvatar';
import './post-box.css';
import './post-box-mobile.css';

const PostBox = ({ userData, onOpenModal }) => {
  const navigate = useNavigate();

  const handleArticleClick = (e) => {
    e.stopPropagation();
    navigate('/article/new');
  };

  return (
    <div className="et-post-box">
      <div className="et-post-box__greeting">
        <BusinessIcon src={BUSINESS_LOTTIE.network} size={30} label="Share an update animation" />
        <h3>What&apos;s on your mind, {userData?.first_name || 'Member'}?</h3>
      </div>

      <div className="et-post-box__trigger" onClick={() => onOpenModal('POST')} role="button" tabIndex={0}>
        <PostComposerAvatar userData={userData} />
        <div className="et-post-box__input">
          Share an update, achievement, or idea...
        </div>
      </div>

      <div className="et-post-box__actions">
        <button type="button" className="et-post-box__chip et-post-box__chip--post" onClick={() => onOpenModal('POST')}>
          <FiEdit3 /> Post
        </button>
        <button type="button" className="et-post-box__chip et-post-box__chip--squad" onClick={() => onOpenModal('SQUAD')}>
          <FiUsers /> Ask Squad
        </button>
        <button type="button" className="et-post-box__chip et-post-box__chip--project" onClick={() => onOpenModal('PROJECT')}>
          <FiSettings /> Project
        </button>
        <button type="button" className="et-post-box__chip et-post-box__chip--win" onClick={() => onOpenModal('WIN')}>
          <FiAward /> Win
        </button>
        <button type="button" className="et-post-box__chip et-post-box__chip--article" onClick={handleArticleClick}>
          <FiFileText /> Write Article
        </button>
      </div>

      <div className="et-post-box__secondary">
        <div className="et-post-box__secondary-item" onClick={() => onOpenModal('POST')} role="button" tabIndex={0}>
          <FiImage style={{ color: '#3b82f6' }} /> Photo
        </div>
        <div className="et-post-box__secondary-item" onClick={() => onOpenModal('POST')} role="button" tabIndex={0}>
          <FiVideo style={{ color: '#10b981' }} /> Video
        </div>
      </div>
    </div>
  );
};

export default PostBox;
