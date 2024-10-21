import Hero from "@/components/Hero/Hero";
import Testimonials from "@/components/Reviews/Testimonials";
import Rooms from "@/components/rooms/Rooms";
export const BASEURL = "http://localhost:8000/api/v1";
export default function Home() {
  return (
    <div className=" w-full h-full flex flex-col items-center mx-auto lg:px-24 px-2 ">
      <Hero />
      <Rooms />
      <Testimonials />
    </div>
  );
}
