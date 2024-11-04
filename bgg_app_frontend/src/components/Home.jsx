import { useState, useEffect } from "react";
import React, { Component } from "react";
import Score from "./Score";
import Users from "./Users";

function Home() {
  return (
    <div className="bg-white flex items-center justify-center min-h-screen p-4">
      <div className="max-w-5xl w-full">
        <h1 className="p-4 mt-10 text-center text-4xl/9 font-bold tracking-tight text-gray-900">
          BGG User Similarity Tool
        </h1>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 bg-white p-4 text-white rounded-lg shadow-md w-full sm:w-3/4 lg:w-1/2">
            <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900 ">
              Similarity Score
            </h2>
            <Score />
          </div>
          <div className="flex-1 bg-white p-4 text-white rounded-lg shadow-md w-full sm:w-3/4 lg:w-1/2">
            <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
              Similar Users
            </h2>
            <Users />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
