// App.tsx
import React, { Dispatch, SetStateAction, useState } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { publicRoutes, protectedRoutes } from './routes';
import { User } from './interfaces/User';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Footer from './components/Footer';
import { UserContext } from './userContext';
import Home from './pages/Home'; // Potrdite pravilno pot
import Posts from './pages/Posts'; // Dodajte direktni import za Posts
import PostDetail from './components/PostDetail';
import Category from './pages/Category';

function App() {
  const [user, setUser] = useState<User | null>(
    localStorage.user ? JSON.parse(localStorage.user) : null
  );

  const updateUserData: Dispatch<SetStateAction<User | null>> = (userInfo) => {
    if (typeof userInfo === 'function') {
      const updatedUser = userInfo(user);
      if (updatedUser) {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        localStorage.removeItem('user');
      }
      setUser(updatedUser);
    } else {
      if (userInfo) {
        localStorage.setItem('user', JSON.stringify(userInfo));
      } else {
        localStorage.removeItem('user');
      }
      setUser(userInfo);
    }
  };

  return (
    <BrowserRouter>
      <UserContext.Provider value={{ user, setUserContext: updateUserData }}>
        <Header />
        <main className="container">
          <Routes>
            {/* Stran Home je vedno dostopna */}
            <Route path="/" element={<Home />} />

            {/* Javni Routes - stran Objave vključena za vse */}
            <Route path="/posts" element={<Posts />} />
            <Route path="/posts/:id" element={<PostDetail />} />
            <Route path="/category/:category" element={<Category />} />
            {publicRoutes
              .filter((route) => route.to !== '/' && route.to !== '/posts') // Home in Objave izvzeti
              .map((route) => (
                <Route
                  key={route.to}
                  path={route.to}
                  element={user ? <Navigate to="/" replace /> : route.element}
                />
              ))}

            {/* Zaščiteni Routes - samo za prijavljene */}
            {protectedRoutes.map((route) => (
              <Route
                key={route.to}
                path={route.to}
                element={<ProtectedRoute user={user} element={route.element} />}
              />
            ))}
          </Routes>
        </main>
      </UserContext.Provider>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
