import TextLogo from "components/TextLogo";
import React from "react";

function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow-md p-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          {/* <img src="/path/to/logo.png" alt="Logo" className="h-8" /> Replace with actual logo path */}
          <TextLogo/>
        </div>
        <div className="space-x-4">
          <a href="#features" className="text-gray-600 hover:text-blue-600 font-medium">Features</a>
          <a href="#pricing" className="text-gray-600 hover:text-blue-600 font-medium">Pricing</a>
          <a href="#contact" className="text-gray-600 hover:text-blue-600 font-medium">Contact</a>
          <a href="/login" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out">Login</a>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="flex-grow flex flex-col items-center justify-center text-center p-8 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
        <h1 className="text-6xl font-extrabold leading-tight mb-6 animate-fade-in-up">
          Unlock Your Learning Potential
        </h1>
        <p className="text-2xl max-w-3xl mx-auto mb-8 opacity-90 animate-fade-in-up delay-200">
          Experience a revolutionary platform designed to make education accessible, engaging, and effective for everyone.
        </p>
        <a href="/register" className="bg-white text-blue-600 hover:bg-gray-100 font-bold py-4 px-10 rounded-full text-xl shadow-lg transform hover:scale-105 transition duration-300 ease-in-out animate-fade-in-up delay-400">
          Start Your Free Trial
        </a>
        <a href="/admin/dashboard" className="m-1 bg-transparent text-white hover:bg-blue-400 font-bold py-4 px-10 rounded-full text-xl shadow-lg transform hover:scale-105 transition duration-300 ease-in-out animate-fade-in-up delay-400 border border-blue-600">
          Go to Dashboard
        </a>
      </header>

      {/* Feature Section */}
      <section id="features" className="py-16 bg-white p-8">
        <h2 className="text-4xl font-bold text-gray-800 text-center mb-12">Why Choose PaperDash?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {/* Feature Card 1 */}
          <div className="flex flex-col items-center text-center p-6 rounded-lg shadow-lg transform hover:scale-105 transition duration-300 ease-in-out bg-blue-50">
            <div className="text-blue-600 mb-4 text-5xl">
              <i className="fas fa-chalkboard-teacher"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Expert Teacher Tools</h3>
            <p className="text-gray-600">Use our tools to create and manage your courses and lessons.</p>
          </div>

          {/* Feature Card 2 */}
          <div className="flex flex-col items-center text-center p-6 rounded-lg shadow-lg transform hover:scale-105 transition duration-300 ease-in-out bg-green-50">
            <div className="text-green-600 mb-4 text-5xl">
              <i className="fas fa-laptop-code"></i>
        </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Build Interactive Courses</h3>
            <p className="text-gray-600">Build interactive courses with our tools.</p>
          </div>

          {/* Feature Card 3 */}
          <div className="flex flex-col items-center text-center p-6 rounded-lg shadow-lg transform hover:scale-105 transition duration-300 ease-in-out bg-purple-50">
            <div className="text-purple-600 mb-4 text-5xl">
              <i className="fas fa-users-class"></i>
              </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Connect with Your Students</h3>
            <p className="text-gray-600">Connect with your students and get help from mentors.</p>
              </div>
              </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-blue-600 text-white text-center p-8">
        <h2 className="text-4xl font-bold mb-6">Ready to Start Your Journey?</h2>
        <p className="text-xl max-w-2xl mx-auto mb-8 opacity-90">
          Join thousands of teachers who are achieving their goals with PaperDash. Sign up today and transform your teaching experience.
        </p>
        <a href="/register" className="bg-white text-blue-600 hover:bg-gray-100 font-bold py-4 px-10 rounded-full text-xl shadow-lg transform hover:scale-105 transition duration-300 ease-in-out">
          Sign Up Now
        </a>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white p-8 text-center">
        <p>&copy; 2024 PaperDash. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Landing;
