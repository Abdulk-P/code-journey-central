import React from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Code, Laptop, Users, Mail, Github, Twitter, Linkedin } from "lucide-react";

const Home: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="py-16 md:py-24 flex flex-col items-center justify-center p-6 md:p-12">
          <div className="max-w-5xl w-full space-y-8">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center mb-4">
                <Code className="h-10 w-10 text-purple-400" />
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                Track Your Coding Journey
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
                ProgressBuddy helps you visualize your growth across coding platforms in one place.
              </p>
              <div className="flex flex-wrap gap-4 justify-center mt-8">
                <Button className="bg-purple-600 hover:bg-purple-700 px-8 py-6 text-lg" asChild>
                  <Link to="/signup">Get Started</Link>
                </Button>
                <Button variant="outline" className="px-8 py-6 text-lg" asChild>
                  <Link to="/signin">Sign In</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 bg-secondary/20">
          <div className="max-w-6xl mx-auto px-6 md:px-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Key Features</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Designed to help you track, analyze and grow your coding skills across platforms.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="glass-card p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 mb-4 rounded-full bg-purple-600/20 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-purple-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Unified Tracking</h3>
                <p className="text-muted-foreground">
                  Connect and monitor your coding activities across LeetCode, GeeksforGeeks, and more in one dashboard.
                </p>
              </div>

              <div className="glass-card p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 mb-4 rounded-full bg-purple-600/20 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-purple-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Smart Insights</h3>
                <p className="text-muted-foreground">
                  Get AI-powered topic suggestions based on your performance and detailed analytics on your progress.
                </p>
              </div>

              <div className="glass-card p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 mb-4 rounded-full bg-purple-600/20 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-purple-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Developer Profile</h3>
                <p className="text-muted-foreground">
                  Build a comprehensive coding profile to showcase your skills, track your journey, and share with recruiters.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-16">
          <div className="max-w-6xl mx-auto px-6 md:px-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">About ProgressBuddy</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We're passionate about helping developers track and improve their coding skills.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-semibold mb-4">Our Mission</h3>
                <p className="mb-4 text-muted-foreground">
                  ProgressBuddy was created with a simple goal: to help developers visualize their coding journey across multiple platforms in one place.
                </p>
                <p className="mb-4 text-muted-foreground">
                  We believe that data-driven insights can help developers identify strengths, address weaknesses, and accelerate their learning.
                </p>
                <h3 className="text-2xl font-semibold mb-4 mt-8">Our Vision</h3>
                <p className="text-muted-foreground">
                  To become the go-to platform for developers looking to track, analyze, and showcase their coding progress across the entire developer ecosystem.
                </p>
              </div>
              <div className="flex justify-center">
                <div className="glass-card p-8 rounded-lg w-full max-w-md">
                  <div className="flex flex-col items-center">
                    <Laptop className="h-20 w-20 text-purple-400 mb-6" />
                    <h3 className="text-xl font-semibold mb-4">Why Choose Us?</h3>
                    <ul className="space-y-3 text-left w-full">
                      <li className="flex items-start">
                        <div className="rounded-full bg-purple-100 p-1 text-purple-600 mr-3 mt-1">✓</div>
                        <p>Unified dashboard for all your coding platforms</p>
                      </li>
                      <li className="flex items-start">
                        <div className="rounded-full bg-purple-100 p-1 text-purple-600 mr-3 mt-1">✓</div>
                        <p>AI-powered recommendations for improvement</p>
                      </li>
                      <li className="flex items-start">
                        <div className="rounded-full bg-purple-100 p-1 text-purple-600 mr-3 mt-1">✓</div>
                        <p>Shareable profiles to showcase your skills</p>
                      </li>
                      <li className="flex items-start">
                        <div className="rounded-full bg-purple-100 p-1 text-purple-600 mr-3 mt-1">✓</div>
                        <p>Detailed analytics to track your growth</p>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-16 bg-secondary/20">
          <div className="max-w-6xl mx-auto px-6 md:px-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Contact Us</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Have questions or feedback? We'd love to hear from you!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="glass-card p-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-purple-600/20 flex items-center justify-center mb-4">
                  <Mail className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Email Us</h3>
                <p className="text-muted-foreground">support@progressbuddy.com</p>
              </div>

              <div className="glass-card p-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-purple-600/20 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Community</h3>
                <p className="text-muted-foreground">Join our Discord community</p>
              </div>

              <div className="glass-card p-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-purple-600/20 flex items-center justify-center mb-4">
                  <Github className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">GitHub</h3>
                <p className="text-muted-foreground">Follow our open source projects</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-secondary bg-background py-8">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Code className="h-6 w-6 text-purple-400 mr-2" />
                <span className="text-xl font-bold text-purple-400">ProgressBuddy</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Track, analyze, and improve your coding skills across platforms.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/#features" className="text-muted-foreground hover:text-purple-400">Features</Link></li>
                <li><Link to="/#about" className="text-muted-foreground hover:text-purple-400">About</Link></li>
                <li><Link to="/#contact" className="text-muted-foreground hover:text-purple-400">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-purple-400">Blog</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-purple-400">FAQ</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-purple-400">Privacy Policy</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-muted-foreground hover:text-purple-400">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-purple-400">
                  <Github className="h-5 w-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-purple-400">
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-secondary/50 mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} ProgressBuddy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
