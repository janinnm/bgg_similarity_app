import { useState, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import React from "react";

function Users() {
  const [formData, setFormData] = useState({ name: "" });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const hasShownSuccessToast = useRef(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/users", {
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
        const arrayData = Array.isArray(result) ? result : Object.keys(result);
        setItems(arrayData);
        if (!hasShownSuccessToast.current) {
          toast.success("Success");
          hasShownSuccessToast.current = true;
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const Loader = () => {
    return (
      <span className="text-sm/6 font-semibold text-gray-900">Loading...</span>
    );
  };

  // container and form design: https://tailwindui.com/components/preview
  return (
    <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label class="block text-sm/6 font-medium text-gray-900">
            Username
          </label>
          <div className="mt-2">
            <input
              className="block w-full rounded-md border-0 p-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
              type="text"
              name="name"
              value={formData.name}
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
        autoClose={1000}
        hideProgressBar={false}
        closeOnClick
        draggable
        theme="light"
      />

      {loading && <Loader />}
      {!loading && (
        <div className="flex items-center justify-center">
          {items.length > 0 && (
            <div className="p-4 max-h-96">
              <p className="text-sm/6 font-bold text-gray-900">
                {" "}
                Check these users 🧑‍🤝‍🧑{" "}
              </p>
              {items.map((item) => (
                <div
                  key={item}
                  className="min-w-0 flex-auto items-center justify-center"
                >
                  <p className="text-sm/6 font-semibold text-gray-900">
                    {"◾ "}
                    {item}{" "}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Users;
