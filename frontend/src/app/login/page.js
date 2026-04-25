"use client"
import GoogleLoginButton from "../../components/GoogleLoginButton";
import signin from "../../assets/images/Me2.png"
import Image from "next/image";
import { useState } from "react";

export default function Login() {
  
    const [message, setMessage] = useState("");
  return (
    <div className="d-flex justify-content-center align-items-start py-5 mt-4 overflow-hidden">
      <div className="col-md-4 col-sm-6 col-11 bg-light p-2 m-md-0 m-2 rounded">

        <div className="text-center mb-3">
          <Image src={signin} className="img-fluid" alt="weaver" />
        </div>

        <div className="px-3 text-start mb-2">
          <b>Signin with...</b>
        </div>
        <GoogleLoginButton />
        {message && (
          <p className="mt-2 text-center text-danger">{message}</p>
        )}
      </div>
    </div>
  );
}
