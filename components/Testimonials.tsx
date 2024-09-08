export default function Testimonials() {
  const testimonials = [
    { name: "Sarah Jones", role: "Artist", content: "VegaArt is the best AI Image generator! I can brainstorm ideas and get stunning visuals in seconds." },
    { name: "David Lee", role: "Graphic Designer", content: "I use VegaArt to create mockups and concept art for clients. It saves me tons of time and allows for a wider range of creative exploration." },
    // Add more testimonials as needed
  ]

  return (
    <section className="py-20 bg-gray-100">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12">Wall of Love</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-600 mb-4">&ldquo;{testimonial.content}&rdquo;</p>
              <div className="font-semibold">{testimonial.name}</div>
              <div className="text-sm text-gray-500">{testimonial.role}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}