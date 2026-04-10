import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  const portals = [
    {
      title: 'Admin Portal',
      description: 'Manage colleges and oversee the verification system',
      icon: '👨‍💼',
      color: 'from-purple-500 to-purple-700',
      route: '/admin/login',
      features: ['Approve/Block Colleges', 'View Statistics', 'Manage System']
    },
    {
      title: 'College Portal',
      description: 'Upload student certificates to blockchain',
      icon: '🏛️',
      color: 'from-blue-500 to-blue-700',
      route: '/college/login',
      features: ['Upload GR Lists', 'Create Students', 'Manage Documents']
    },
    {
      title: 'Student Portal',
      description: 'View your verified academic certificates',
      icon: '🎓',
      color: 'from-green-500 to-green-700',
      route: '/student/login',
      features: ['View Documents', 'Blockchain Hash', 'Report Issues']
    },
    {
      title: 'Company Portal',
      description: 'Verify student certificates instantly',
      icon: '🏢',
      color: 'from-orange-500 to-orange-700',
      route: '/company/login',
      features: ['Instant Verification', 'Hash Comparison', 'View History']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Header */}
      <nav className="bg-black bg-opacity-20 backdrop-blur-md border-b border-white border-opacity-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl font-bold">🔐</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">CredVerify</h1>
                <p className="text-xs text-gray-300">Blockchain Certificate Verification</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-extrabold text-white mb-4">
            Academic Document Verification
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
              Powered by Blockchain
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Secure, tamper-proof, and instant verification of academic certificates
            using Ethereum blockchain technology and SHA-256 hashing
          </p>
        </div>

        {/* Portal Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {portals.map((portal, index) => (
            <div
              key={index}
              className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300 cursor-pointer transform hover:scale-105"
              onClick={() => navigate(portal.route)}
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${portal.color} rounded-xl flex items-center justify-center text-3xl mb-4`}>
                {portal.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{portal.title}</h3>
              <p className="text-gray-300 text-sm mb-4">{portal.description}</p>
              <ul className="space-y-2">
                {portal.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-gray-400 text-sm">
                    <span className="text-green-400 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="mt-4 w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all">
                Access Portal
              </button>
            </div>
          ))}
        </div>

        {/* Features Section */}
        <div className="bg-white bg-opacity-5 backdrop-blur-lg rounded-2xl p-8 border border-white border-opacity-10">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">Why Choose CredVerify?</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                🔒
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Blockchain Security</h4>
              <p className="text-gray-400 text-sm">
                Immutable records stored on Ethereum blockchain ensuring tamper-proof verification
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                ⚡
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Instant Verification</h4>
              <p className="text-gray-400 text-sm">
                Companies can verify certificates in seconds using SHA-256 hash comparison
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                🛡️
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Privacy Protected</h4>
              <p className="text-gray-400 text-sm">
                Decentralized system with role-based access ensuring data privacy
              </p>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 text-sm mb-4">Built with</p>
          <div className="flex flex-wrap justify-center gap-4">
            {['React.js', 'Node.js', 'MongoDB', 'Ethereum', 'Solidity', 'Hardhat'].map((tech) => (
              <span key={tech} className="px-4 py-2 bg-white bg-opacity-10 rounded-full text-white text-sm">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black bg-opacity-20 backdrop-blur-md border-t border-white border-opacity-10 py-6 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 CertifyChain. Secure Academic Document Verification System.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
