import React from 'react';

interface CourseSectionProps {
  section: {
    id: string;
    type: string;
    content: {
      title?: string;
      subtitle?: string;
      description?: string;
      course?: {
        title: string;
        description: string;
        instructor?: string;
        duration?: string;
        level?: string;
        price?: number;
        image?: string;
        modules?: Array<{
          title: string;
          description: string;
          duration?: string;
          lessons?: number;
        }>;
      };
      backgroundColor?: string;
      textColor?: string;
    };
  };
}

const CourseSection: React.FC<CourseSectionProps> = ({ section }) => {
  const { content } = section;

  const defaultCourse = {
    title: "Complete Mastery Course",
    description: "Transform your skills with our comprehensive course designed by industry experts.",
    instructor: "Expert Instructor",
    duration: "8 weeks",
    level: "Beginner to Advanced",
    price: 299,
    image: "/api/placeholder/600/400",
    modules: [
      {
        title: "Foundation Principles",
        description: "Master the fundamental concepts and core principles.",
        duration: "1 week",
        lessons: 5
      },
      {
        title: "Advanced Techniques",
        description: "Learn advanced strategies and best practices.",
        duration: "2 weeks",
        lessons: 8
      },
      {
        title: "Practical Application",
        description: "Apply your knowledge through hands-on projects.",
        duration: "3 weeks",
        lessons: 12
      },
      {
        title: "Mastery & Certification",
        description: "Complete your journey and earn your certification.",
        duration: "2 weeks",
        lessons: 6
      }
    ]
  };

  const course = content.course || defaultCourse;

  return (
    <section className={`py-16 px-4 sm:px-6 lg:px-8 ${content.backgroundColor || 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          {content.title && (
            <h2 className="text-3xl font-bold mb-4 text-gray-900">
              {content.title}
            </h2>
          )}
          {content.subtitle && (
            <p className="text-xl text-gray-600 mb-6">
              {content.subtitle}
            </p>
          )}
          {content.description && (
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              {content.description}
            </p>
          )}
        </div>

        {/* Course Overview */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-12">
          <div className="md:flex">
            {course.image && (
              <div className="md:w-1/2">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-64 md:h-full object-cover"
                />
              </div>
            )}
            <div className={`${course.image ? 'md:w-1/2' : 'w-full'} p-8`}>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">{course.title}</h3>
              <p className="text-gray-600 mb-6">{course.description}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {course.instructor && (
                  <div className="flex items-center">
                    <div className="w-5 h-5 text-blue-600 mr-2">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-600">Instructor: {course.instructor}</span>
                  </div>
                )}
                
                {course.duration && (
                  <div className="flex items-center">
                    <div className="w-5 h-5 text-blue-600 mr-2">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-600">Duration: {course.duration}</span>
                  </div>
                )}
                
                {course.level && (
                  <div className="flex items-center">
                    <div className="w-5 h-5 text-blue-600 mr-2">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-600">Level: {course.level}</span>
                  </div>
                )}
                
                {course.price && (
                  <div className="flex items-center">
                    <div className="w-5 h-5 text-blue-600 mr-2">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">${course.price}</span>
                  </div>
                )}
              </div>
              
              <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                Enroll Now
              </button>
            </div>
          </div>
        </div>

        {/* Course Modules */}
        {course.modules && course.modules.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold mb-8 text-center text-gray-900">Course Curriculum</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {course.modules.map((module, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-lg">
                  <div className="flex items-start mb-3">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-1">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">{module.title}</h4>
                      <p className="text-gray-600 mb-3">{module.description}</p>
                      <div className="flex justify-between text-sm text-gray-500">
                        {module.duration && <span>Duration: {module.duration}</span>}
                        {module.lessons && <span>{module.lessons} lessons</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="text-center mt-12">
          <div className="bg-blue-600 text-white p-8 rounded-lg">
            <h3 className="text-2xl font-bold mb-4">Ready to Start Learning?</h3>
            <p className="text-blue-100 mb-6">Join thousands of students who have transformed their careers</p>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold">
              Get Started Today
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CourseSection;
