import React from 'react';
import { Route, Routes } from 'react-router-dom';
import ArticleEditor from './ArticleEditor';
import ArticleList from './ArticleList';
import ArticleView from './ArticleView';

const ArticleRoutes = ({ userData }) => {
  return (
    <Routes>
      <Route path="new" element={<ArticleEditor userData={userData} />} />
      <Route path="edit/:articleId" element={<ArticleEditor userData={userData} />} />
      <Route path="list" element={<ArticleList userData={userData} />} />
      <Route path="preview" element={<ArticleView userData={userData} />} />
      <Route path="view/:articleId" element={<ArticleView userData={userData} />} />
      <Route path="/" element={<ArticleList userData={userData} />} />
    </Routes>
  );
};

export default ArticleRoutes;