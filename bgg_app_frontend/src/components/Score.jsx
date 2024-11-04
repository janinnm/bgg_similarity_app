import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import React from "react";

function Score() {
  const [formData, setFormData] = useState({ name1: "", name2: "" });
  const [apiResult, setApiResult] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/compare", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        data.error_messages.forEach((msg) => {
          toast.error(msg);
        });
      } else {
        const result = await response.json();
        setApiResult(result);
        toast.success("Operation successful!");
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    }
  };

  const PercentageDisplay = ({ apiResult }) => {
    const percentage = (apiResult.result.score * 100).toFixed(2) + "%";

    let text = "";
    if (apiResult.result.score * 100 > 75) {
      text = `Congratulations! 🎉 ${apiResult.result.name1} is ${percentage} similar to ${apiResult.result.name2}`;
    } else {
      text = `${apiResult.result.name1} is only ${percentage} similar to ${apiResult.result.name2} 😢`;
    }

    return <div>{text}</div>;
  };

  return (
    <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label class="block text-sm/6 font-medium text-gray-900">
            Username 1
          </label>
          <div className="mt-2">
            <input
              className="block w-full rounded-md border-0 p-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
              type="text"
              name="name1"
              value={formData.name1}
              onChange={handleChange}
            />
          </div>
        </div>
        <div>
          <div>
            <label class="block text-sm/6 font-medium text-gray-900">
              Username 2
            </label>
            <input
              className="block w-full rounded-md border-0 p-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
              type="text"
              name="name2"
              value={formData.name2}
              onChange={handleChange}
            />
          </div>
        </div>
        <div>
          <button
            class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            type="submit"
          >
            {" "}
            Submit
          </button>
        </div>
      </form>

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
      />

      {apiResult && (
        <div className="py-4 max-h-96">
          <div className="text-sm/6 font-semibold text-gray-900">
            <PercentageDisplay apiResult={apiResult} />
          </div>
        </div>
      )}
    </div>
  );
}

export default Score;
