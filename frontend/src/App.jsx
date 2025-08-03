import React from 'react'
import { Navigate, Route, Routes } from 'react-router'

import HomePage from "./pages/HomePage.jsx";
import FriendsPage from "./pages/FriendsPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import CallPage from "./pages/CallPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import OnboardingPage from "./pages/OnboardingPage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import { Toaster } from 'react-hot-toast';
import PageLoader from './components/PageLoader.jsx';
import useAuthUser from './hooks/useAuthUser.js';
import Layout from './components/Layout.jsx';
import { useThemeStore } from './store/useThemeStore.js';


const App = () => {

  const {isLoading, authUser } = useAuthUser();
  const {theme } = useThemeStore();

  const isAuthenticated = Boolean(authUser);
  const isOnBoarded = authUser?.isOnBoarded;
  

  if(isLoading) return <PageLoader />;

  return (
    <div className=' h-screen' data-theme={theme}>
      
       <Routes>
        <Route path='/' element={isAuthenticated && isOnBoarded ? (
          <Layout showSidebar>
            <HomePage />
          </Layout>
          
        ) : (
          <Navigate to={!isAuthenticated? "/login" : "/onboarding" } />
        ) } />
        <Route path='/login' element={ !isAuthenticated? <LoginPage /> : <Navigate to={
          isOnBoarded? '/' : "/onboarding"
        } /> }/>
        <Route path='/call/:id' element={
          isAuthenticated && isOnBoarded ?(
            <CallPage />
          ) : (
            <Navigate to={isAuthenticated? "/onboarding": "/login"} />
          )
        }/>
        <Route path='/chat/:id' element={
          isAuthenticated && isOnBoarded ? (
            <Layout showSidebar>
              <ChatPage/>
            </Layout>
          ) : (
            <Navigate to={isAuthenticated? "/onboarding" : "/login" } />
          )
        }/>
        <Route path='/notifications' element={isAuthenticated && isOnBoarded ? (
          <Layout showSidebar>
            <NotificationsPage />
          </Layout>
        ) : (
          <Navigate to={isAuthenticated ? "/onboarding" : "/login"} />
        ) }/>
        <Route path='/friends' element={isAuthenticated && isOnBoarded ? (
          <Layout showSidebar>
            <FriendsPage />
          </Layout>
        ) : (
          <Navigate to={isAuthenticated ? "/onboarding" : "/login"} />
        ) }/>
        <Route path='/onboarding' element={isAuthenticated ? (
          !isOnBoarded ? (
            <OnboardingPage />
          ) : (
            <Navigate to="/" />
          )
        ) : (
          <Navigate to="/login" />
        ) }/>
        <Route path='/signup' element={ !isAuthenticated? <SignUpPage /> : <Navigate to={
          isOnBoarded? '/' : "/onboarding"
        } /> }/>

       </Routes>

       <Toaster />
    </div>
  )
}

export default App