export default function Features() {
  const features = [
    { title: "Text to Image", description: "Describe your vision with words, and watch VegaArt's powerful tool translate them into captivating artwork." },
    { title: "Text to Video", description: "Convert scripts or ideas into stunning 4K videos with just a few clicks using VegaArt's advanced AI." },
    { title: "Real Time Generation", description: "Witness your ideas blended as Real-Time Generation lets you sketch and see your creation come to life before your eyes." },
    // Add more features as needed
  ]

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12">Our AI Tools Suite</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-gray-100 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}