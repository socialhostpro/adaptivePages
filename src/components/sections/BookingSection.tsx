import React from 'react';

interface BookingSectionProps {
  section: {
    id: string;
    type: string;
    content: {
      title?: string;
      subtitle?: string;
      description?: string;
      bookingUrl?: string;
      services?: Array<{
        name: string;
        duration: string;
        price: string;
        description?: string;
      }>;
      backgroundColor?: string;
      textColor?: string;
    };
  };
}

const BookingSection: React.FC<BookingSectionProps> = ({ section }) => {
  const { content } = section;

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

        {/* Services Grid */}
        {content.services && content.services.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {content.services.map((service, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold mb-3 text-gray-900">{service.name}</h3>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-600">{service.duration}</span>
                  <span className="text-2xl font-bold text-blue-600">{service.price}</span>
                </div>
                {service.description && (
                  <p className="text-gray-700 mb-4">{service.description}</p>
                )}
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                  Book Now
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Booking Widget */}
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
          <h3 className="text-2xl font-semibold mb-6 text-center text-gray-900">Schedule Your Appointment</h3>
          
          {content.bookingUrl ? (
            <div className="text-center">
              <iframe
                src={content.bookingUrl}
                width="100%"
                height="600"
                frameBorder="0"
                className="rounded-lg"
              ></iframe>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Service</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>Choose a service</option>
                    {content.services?.map((service, index) => (
                      <option key={index} value={service.name}>{service.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Time</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>Choose a time</option>
                    <option>9:00 AM</option>
                    <option>10:00 AM</option>
                    <option>11:00 AM</option>
                    <option>2:00 PM</option>
                    <option>3:00 PM</option>
                    <option>4:00 PM</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                  <input
                    type="text"
                    placeholder="60 minutes"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    readOnly
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <input
                type="tel"
                placeholder="Phone Number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              <textarea
                rows={3}
                placeholder="Additional Notes (Optional)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              ></textarea>

              <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                Confirm Booking
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default BookingSection;
