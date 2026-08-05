"use client";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Image from "next/image";
import Rating from "@/components/ui/Rating";
import { testimonials } from "@/lib/staticData";

const Testimonials = () => {
  const settings = {
    dots: true,
    arrows: false,
    infinite: true,
    speed: 500,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    cssEase: "linear",
    pauseOnHover: true,
    pauseOnFocus: true,
    responsive: [
      {
        breakpoint: 10000,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: true,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          initialSlide: 2,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <div className="w-full h-auto py-10 mb-10 relative overflow-hidden">
      <div className="container">
        {/* header section */}
        <div className="text-center mb-10 max-w-[400px] mx-auto">
          <p className="text-lg text-sky-500 font-medium">
            What our customers are saying
          </p>
          <h1 className="lg:text-5xl text-3xl font-bold">Testimonials</h1>
          <p className="text-sm md:text-lg text-gray-500 dark:text-gray-400">
            Real experiences from guests who stayed with us.
          </p>
        </div>

        {/* Testimonial cards */}
        <div className="w-full mx-auto">
          <Slider {...settings}>
            {testimonials.map((data) => (
              <div key={data.id} className="my-6 px-2">
                <div className="flex flex-col gap-4 shadow-lg py-8 rounded-xl p-3 dark:bg-gray-800 dark:text-white bg-slate-100 relative h-full">
                  <div className="flex items-center gap-4">
                    <Image
                      width={60}
                      height={60}
                      src={data.img}
                      alt="user-image"
                      className="rounded-full w-16 h-16 object-cover"
                    />
                    <div>
                      <h1 className="text-lg font-bold">{data.name}</h1>
                      <p className="text-xs text-gray-500 dark:text-slate-300">
                        {data.role}
                      </p>
                      <Rating value={data.rating} />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-slate-200 leading-relaxed">
                    &ldquo;{data.text}&rdquo;
                  </p>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
