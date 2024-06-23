"use client";
import React, { useEffect, useState, useRef, ChangeEvent } from "react";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";
import camera from "../utils/camera.png";
import start from "../utils/start.png";
import page1 from "../utils/page-1.png";
import page1Text from "../utils/page-1-text.png";
import page2 from "../utils/page-2.png";
import page3 from "../utils/page-3.png";
import img1 from "../utils/football/img1.png";
import img2 from "../utils/football/img2.png";
import emailPage from "../utils/email.png";
import afterUserImg from "../utils/after-user-img.png";
import { RiErrorWarningLine } from "react-icons/ri";
import { CiCamera } from "react-icons/ci";
import { MdEmail } from "react-icons/md";
import { PiPrinterDuotone } from "react-icons/pi";

import frame from "../utils/frame.png";

import axios from "axios";

const imageData = [
  {
    id: 1,
    src: img1,
    alt: "Description for Image 1",
    prompt: "superman",
  },
  {
    id: 2,
    src: img2,
    alt: "Description for Image 2",
    prompt: "superman",
  },
  {
    id: 3,
    src: img1,
    alt: "Description for Image 1",
    prompt: "superman",
  },
  {
    id: 4,
    src: img2,
    alt: "Description for Image 2",
    prompt: "superman",
  },
  {
    id: 5,
    src: img1,
    alt: "Description for Image 1",
    prompt: "superman",
  },
  {
    id: 6,
    src: img2,
    alt: "Description for Image 2",
    prompt: "superman",
  },
  {
    id: 7,
    src: img1,
    alt: "Description for Image 1",
    prompt: "superman",
  },
  {
    id: 8,
    src: img2,
    alt: "Description for Image 2",
    prompt: "superman",
  },
];

const Hero = () => {
  const [image, setImage] = useState<File | null>(null);
  // for user image preview
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  // enter fields
  const [prompt, setPrompt] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  // final image state
  const [resultImage, setResultImage] = useState<string | null>("");
  // https://storage.googleapis.com/imaginarium-bucket/1701200839634-9071327748677547.jpg
  // steps for show previous or next jsx element
  const [step, setStep] = useState(1);

  // loading
  const [loading, setLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  // terms and conditions checking
  const [isChecked, setIsChecked] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  // selected image
  const [selectedImageId, setSelectedImageId] = useState<
    number | undefined | null
  >(null);

  const handleSelectImage = (id: number) => {
    setSelectedImageId(id);
    const selectedImage = imageData.find((image) => image.id === id);
    if (selectedImage) {
      setPrompt(selectedImage.prompt);
    }
    console.log(prompt);
  };

  // Handlers for step transitions
  const handleNext = () => {
    if (step < 6) setStep(step + 1);
  };

  const startOver = () => {
    setStep(1); // Navigate to the prompt input step
    setResultImage(null);
    setPrompt("");
    setImage(null);
    setImageUrl(undefined);
    setIsChecked(false);
    setSelectedImageId(null);
  };

  // Function to handle the API response
  const handleResponse = async (response: any) => {
    if (response.ok) {
      const data = await response.json();
      if (data.imageUrl) {
        setResultImage(data.imageUrl);
        toast.dismiss(); // Dismiss the loading toast
        toast.success("Image generation completed!");
      } else {
        console.error("URL not found in response");
        toast.error("URL not found in response");
      }
    } else {
      toast.dismiss(); // Dismiss the loading toast before displaying the error message
      const errorData = await response.json();
      // Check for nested error structure
      const errorMessage =
        errorData.error && errorData.error.error
          ? errorData.error.error
          : errorData.error;

      setErrorMessage(errorMessage);
      switch (errorMessage) {
        case "Each image should have exactly one face.":
          toast.error("Error: Each image should have exactly one face.");
          break;
        case "Multiple faces detected. Only single-face detection is supported.":
          toast.error(
            "Error: Multiple faces detected. Only single-face detection is supported."
          );
          break;
        case "No face detected":
          toast.error("Error: No face detected in the uploaded image.");
          break;
        case "Inappropriate content detected in the prompt.":
          // toast.error("Error: Inappropriate content detected in the prompt.");
          setStep(2);
          break;
        default:
          console.error("Unexpected error:", errorData);
          toast.error("An unexpected error occurred. Please try again later.");
          break;
      }
    }
  };
  // chack image
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      setImage(file);
      setImageUrl(URL.createObjectURL(file));
      setResultImage(null);
    }
  };

  const handleSubmit = async () => {
    if (!image || !prompt) {
      console.error("Image and prompt are required");
      return;
    }

    const formData = new FormData();
    formData.append("userImage", image);
    formData.append("prompt", prompt);
    formData.append("name", name);

    try {
      setLoading(true); // Start loading before the request
      const response = await fetch(
        "https://abovedigital-1696444393502.ew.r.appspot.com/generate-and-swap-face",
        {
          method: "POST",
          body: formData,
        }
      );

      await handleResponse(response);
      setLoading(false);
    } catch (error) {
      console.error("Request failed:", error);
      toast.error("An error occurred while processing your request.");
    } finally {
      setLoading(false); // Always stop loading after the request is complete
    }
  };

  const handleEmail = async (e: any) => {
    e.preventDefault();

    try {
      setEmailLoading(true);
      const emailResponse = await axios.post(
        "https://abovedigital-1696444393502.ew.r.appspot.com/v1/mail",
        {
          toEmail: email,
          subject: "AI Imaginarium",
          message: "Your Generated Image",
          imageUrl: resultImage,
        }
      );

      console.log("Email sent successfully", emailResponse.data);
      toast.success("Email sent successfully");
      setEmail("");
      setEmailLoading(false);
      if (step < 6) setStep(step + 1);
    } catch (error) {
      console.error("Failed to send email", error);
      toast.error("Failed to send email");
      setEmailLoading(false);
    }
  };
  const handlePrint = async (e: any) => {
    e.preventDefault();
    setEmailLoading(true); // Assuming you want to indicate loading when print starts

    try {
      // const response = await fetch("http://localhost:8080/v1/print", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     imageUrl: resultImage, // Using the state variable that holds the image URL
      //   }),
      // });

      // if (!response.ok) {
      //   throw new Error(`HTTP error! status: ${response.status}`);
      // }

      // const data = await response.json(); // Assuming your API responds with JSON
      // console.log(data); // Do something with the data
      // toast.success("Print initiated successfully"); // Display success message
      if (step < 6) setStep(step + 1);
    } catch (error) {
      console.error("Failed to print", error);
      toast.error("Failed to print");
    } finally {
      setEmailLoading(false); // Turn off loading indication regardless of outcome
    }
  };

  return (
    <>
      <div className="w-full flex justify-center items-center flex-col gap-[7vmin]">
        <Toaster />

        {errorMessage && (
          <div
            className="flex items-center p-4 mb-4 text-md text-red-800 border border-red-300 rounded-lg fadeIn bg-red-50 "
            role="alert"
          >
            <svg
              className="flex-shrink-0 inline w-4 h-4 me-3"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
            </svg>
            <span className="sr-only">Info</span>
            <div>
              <span className="font-bold">Error:</span> {errorMessage}
            </div>
          </div>
        )}
        {loading && (
          <div className="fadeIn absolute inset-0 min-h-screen z-20 flex w-full justify-center items-center flex-col gap-5">
            <Image src={page3} alt="euro 2024" fill />
            <div className="absolute z-10 top-1/3 flex flex-col items-center gap-3">
              <h1 className="text-[#eee98e] text-center text-4xl">
                Κάνε λίγο υπομονή!
              </h1>
              <button
                disabled
                type="button"
                className="text-lg px-8 py-4 font-medium text-gray-900 bg-gray-500 rounded-lg items-center justify-center"
              >
                <svg
                  aria-hidden="true"
                  role="status"
                  className="inline w-8 h-8 text-gray-200 animate-spin "
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="#1C64F2"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
        {/* password */}
        {step === 1 && (
          <div className="flex items-center justify-center">
            <Image src={page1} alt="euro 2024" fill className="absolute" />
            <div className="z-10 inset-0 w-full flex justify-center items-center h-screen absolute">
              <div className="w-1/2"></div>
              <div className="w-1/2 flex flex-col items-center justify-center gap-2">
                <h1 className="text-[#eee98e] text-center text-4xl">
                  Είσαι έτοιμος;
                  <br /> Γίνε μέρος της μεγάλης διοργάνωσης
                  <br /> με τα αγαπημένα σου
                  <br /> Αxe, Dove Men +care, Ultrex,
                  <br /> μπες στη φάση και...
                </h1>
                <div className="w-1/2">
                  <Image src={page1Text} alt="euro 2024" width={600} />
                </div>
                <button
                  onClick={handleNext}
                  disabled={loading}
                  className="bg-[#00ffff] text-[#003463] text-4xl p-2 rounded-sm px-5"
                >
                  Επόμενο
                </button>
              </div>
            </div>
          </div>
        )}

        {/* upload field */}
        <div className="flex flex-col gap-5 items-center justify-center w-full">
          {/* enter prompt */}
          {step === 2 && (
            <div className="flex fadeIn justify-center flex-col items-center  gap-4 p-3">
              <Image src={page2} alt="euro 2024" fill className="absolute" />
              <div className="w-full flex items-center justify-center gap-4 flex-col relative z-10 pt-40">
                <h1 className="text-[#eee98e] text-center text-3xl">
                  Διάλεξε μία από τις παρακάτω ποδοσφαιρικές φάσεις
                  <br /> και γίνε μέρος της, μέσω της τεχνολογίας ΑΙ!
                </h1>
                <div className="grid grid-cols-4 gap-4">
                  {imageData.map((image, index) => (
                    <div
                      key={index}
                      className={`w-full relative border-4 ${
                        selectedImageId === image.id
                          ? "border-red-600"
                          : "border-transparent"
                      }`}
                      onClick={() => handleSelectImage(image.id)}
                    >
                      <Image
                        className="curson-pointer rounded-md"
                        src={image.src}
                        alt={image.alt}
                        width={250}
                        height={100}
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleNext}
                  disabled={selectedImageId === null}
                  className={`${
                    selectedImageId === null ? "bg-[#136464]" : "bg-[#00ffff]"
                  } w-48 text-[#003463] text-4xl p-2 rounded-sm px-5`}
                >
                  Επόμενο
                </button>
              </div>
            </div>
          )}
          {/* upload image */}
          {step === 3 &&
            (resultImage ? null : imageUrl ? (
              // if user image is uploaded
              <div className="flex w-full flex-col gap-10 justify-between items-center">
                <Image src={afterUserImg} alt="euro 2024" fill />
                <div className="relative z-10 flex items-center justify-center min-h-screen gap-5 w-full">
                  <div className="flex flex-col gap-5">
                    <h1 className="text-[#eee98e] text-center text-3xl">
                      Η φωτογραφία σου ανέβηκε!
                    </h1>

                    {/* preview image */}
                    {!loading && (
                      <img
                        src={imageUrl}
                        alt="Preview"
                        style={{ maxWidth: "100%", maxHeight: "400px" }}
                        className="rounded-md"
                      />
                    )}
                  </div>
                  {/* upload again button */}
                  <div className="flex flex-col gap-10 absolute top-1/3 right-48">
                    {!loading && (
                      <label
                        className={`flex w-full items-center justify-center border-b-2 text-center ${
                          loading
                            ? "bg-violet-300 cursor-not-allowed"
                            : " bg-[#262262] cursor-pointer hover:bg-violet-500 transition-all"
                        } gap-2 px-2`}
                      >
                        <h1 className="font-bold text-4xl py-2 text-white">
                          Δοκίμασε ξανά
                        </h1>

                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          disabled={loading}
                        />
                      </label>
                    )}
                    <button
                      onClick={handleSubmit}
                      disabled={!imageUrl}
                      className="bg-[#00ffff] text-[#003463] text-4xl p-2 rounded-sm px-5"
                    >
                      Επόμενο
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // Render the image upload section when neither imageUrl nor resultImage is set
              <div className="flex flex-col min-h-screen fadeIn items-center justify-start">
                <Image src={page3} alt="euro 2024" layout="fill" />
                <div className="flex flex-col relative z-10 justify-start items-center w-full gap-5 pt-40">
                  <div className="flex flex-col gap-2 text-center">
                    <h2 className="text-4xl text-[#eee98e]">
                      Βγάλε μια φωτογραφία σου
                    </h2>
                    <h3 className="text-2xl text-[#eee98e]">
                      κάνοντας tap στο παρακάτω icon
                    </h3>
                  </div>
                  <label className="flex flex-col items-center justify-center rounded-lg text-center cursor-pointer">
                    <div className="flex flex-col border-2 rounded-lg items-center justify-center p-2">
                      <CiCamera size={100} className="text-white" />
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  <div className="flex items-center gap-2 text-white">
                    <RiErrorWarningLine size={40} />{" "}
                    <p>
                      Βεβαιώσου ότι δεν καλύπτει
                      <br /> κάτι το πρόσωπό σου
                    </p>
                  </div>
                </div>
              </div>
            ))}

          {step === 3 && resultImage && (
            <>
              <Image src={page2} alt="euro 2024" fill className="absolute" />
              <div className="flex relative w-full justify-center items-center min-h-screen z-10 top-1/2">
                <h1 className="text-4xl text-[#eee98e]">
                  Η φωτογραφία σου είναι έτοιμη!
                </h1>

                <button
                  onClick={handleNext}
                  disabled={loading}
                  className="bg-[#00ffff] text-[#003463] text-4xl h-14 p-2 rounded-sm px-5"
                >
                  Επόμενο
                </button>
              </div>
            </>
          )}
          {step === 4 && resultImage && (
            <div className="flex flex-col gap-5 ">
              <Image
                src={emailPage}
                alt="euro 2024"
                fill
                className="absolute"
              />
              <div className="relative z-10 flex items-center justify-center min-h-screen">
                <div className="flex flex-col justify-center items-center gap-5 w-3/4">
                  <h1 className="text-white flex text-2xl items-center gap-2">
                    <MdEmail size={140} />
                    Στείλε τη φωτογραφία στο e-mail σου και ανέβασέ την στα
                    social media!
                  </h1>
                  <input
                    type="name"
                    id="name"
                    className="bg-transparent border-b border-gray-300 text-white text-2xl block w-full p-2.5 placeholder:text-2xl focus:border-b outline-none"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Όνομα"
                  />
                  <input
                    type="email"
                    id="email"
                    className="bg-transparent border-b border-gray-300 text-white text-2xl block w-full p-2.5 placeholder:text-2xl focus:border-b outline-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email"
                  />
                  <button
                    className={`flex gap-2 items-center text-2xl justify-center  text-white font-bold py-2 px-4 w-1/3 ${
                      !email || !name
                        ? "bg-gray-500 hover:bg-gray-600 cursor-not-allowed"
                        : "bg-[#00ffff] "
                    }`}
                    type="button"
                    disabled={!email || emailLoading}
                    onClick={handleEmail}
                  >
                    Αποστολή
                  </button>
                  <button
                    className={`flex gap-2 items-center justify-center  text-white font-bold py-2 px-4 w-full text-2xl bg-[#27a7de]`}
                    type="button"
                    onClick={handlePrint}
                  >
                    <PiPrinterDuotone />
                    Εκτύπωσε τη φωτογραφία σου!
                  </button>
                </div>
              </div>
            </div>
          )}
          {step === 5 && (
            <div className="flex w-full justify-between gap-5">
              <Image src={page1} alt="euro 2024" fill className="absolute" />
              <div className="flex-1"></div>
              <div className="relative z-10 flex justify-center items-center flex-1 h-screen flex-col gap-5">
                <h1 className="text-4xl text-[#eee98e] text-center">
                  Συγχαρητήρια.
                  <br /> Είσαι... πρωταθλητής Ευρώπης!
                </h1>
                <button
                  className="flex gap-2 items-center text-3xl bg-[#3ec5ff] text-[#003463] py-2 px-4"
                  onClick={startOver}
                >
                  Πάμε πάλι;
                </button>
              </div>
            </div>
          )}
          {resultImage && (
            <div className="absolute p-5 h-1/2">
              {/* The image that you want to show inside the frame */}
              <Image
                className="rounded-lg pt-20 cursor-pointer border-3 border-violet-950"
                // fill
                width={450}
                height={450}
                // objectFit="cover"
                src={`${resultImage}`}
                alt="Result"
              />

              {/* The frame overlay */}
              <div className="absolute top-0 left-0 right-0 bottom-0">
                <Image
                  className="rounded-lg"
                  src={frame} // The path to your frame image
                  width={500}
                  height={500}
                  // objectFit="contain"
                  alt="Frame"
                />
              </div>
            </div>
          )}
          {/* user image preview */}
        </div>
      </div>
    </>
  );
};

export default Hero;
