"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { BASEURL } from "@/app/page";
import { useRouter } from "next/navigation";
import { useAuth } from "@/Hooks/AuthProvider";
// import useAuth from "@/Hooks/useAuth";
const SignIn = () => {
  const { login, token } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (token) {
      router.push("/");
      return;
    }
  }, [token, router]);
  const [state, setState] = useState({
    email: "",
    password: "",
  });
  const inputHandle = (e) => {
    setState({
      ...state,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${BASEURL}/user/sign-in`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(state),
      });
      const data = await res.json();
      // console.log("response:", data);
      if (data.success) {
        login(data.token, data.data);
        // localStorage.setItem("token", data.token);
        // localStorage.setItem("user", data.data);
        window.alert("Sign in successfully!");
        router.push("/");
      }
    } catch (error) {
      // console.error("Error during login:", error);
      window.alert(`Error during login ${error}`);
    }
  };
  return (
    <div className=" w-full h-full flex items-start justify-center md:pt-20 ">
      {/* iPhone 6-8 landscape · width: 667px */}
      <div className=" lg:w-[70%] w-full flex md:flex-row landscape:flex-row flex-col items-center justify-center ">
        {/* image section */}
        <div className=" lg:w-1/2 w-full">
          <Image
            src="https://img.freepik.com/free-vector/login-concept-illustration_114360-739.jpg?w=740&t=st=1729506605~exp=1729507205~hmac=ba327f5e28ce28bf80db26f4018fbad2060e3f22a7693cf24f80ea986c4fa287"
            width={400}
            height={400}
            alt="Login Image"
            className="  "
          />
        </div>
        {/* login form section */}
        <div className=" lg:w-1/2 w-full lg:p-10 p-5 ">
          <h1 className=" capitalize w-full text-center py-10 text-3xl font-bold ">
            Please login
          </h1>
          <form onSubmit={handleSubmit} className=" flex flex-col gap-4 ">
            <input
              type="email"
              name="email"
              value={state.email}
              onChange={inputHandle}
              placeholder="email *"
              className=" w-full p-2 outline outline-black rounded "
              required
            />
            <input
              type="password"
              name="password"
              value={state.password}
              onChange={inputHandle}
              placeholder="password *"
              className=" w-full p-2 outline outline-black rounded "
              required
            />
            <button
              type="submit"
              className=" w-full p-2 py-3 bg-black text-white text-xl font-semibold rounded "
            >
              Sign In
            </button>
          </form>
          {/* {isError && (
            <p className="text-red-500 mt-2">
              Register failed. Please try again.
            </p>
          )} */}
          <div>
            <h1>
              Does not have an Account ?
              <Link href="/sign-up" className=" underline font-bold ">
                <span> Register</span>
              </Link>
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
