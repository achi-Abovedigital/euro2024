"use client";
import React, { useEffect, useState, useRef, ChangeEvent } from "react";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";

import camera from "../utils/camera.png";
import {
  getFirestore,
  query,
  collection,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/app/firebaseConfig";

import axios from "axios";

// import { bg1 } from "../utils/pages/index";
import bg1 from "../utils/pages/bg1.jpg";
import bg2 from "../utils/pages/bg2.jpg";
import bg3 from "../utils/pages/bg3.webp";
import bg4 from "../utils/pages/bg4.webp";
import bg5 from "../utils/pages/bg5.jpg";
import bg6 from "../utils/pages/bg6.webp";
import bg7 from "../utils/pages/bg7.jpg";
import bg8 from "../utils/pages/bg8.jpg";
// buttons
import btn1 from "../utils/buttons/ btn_next_p1p2.png";
import btnUpload from "../utils/buttons/btn_upload.png";
import btnSend from "../utils/buttons/btn_send.png";
import btnUploadAgain from "../utils/buttons/btn_try_again.png";
import btnPrint from "../utils/buttons/btn_print.png";
import startAgain from "../utils/buttons/btn_play_again.png";
import btnBackHome from "../utils/buttons/btn_back_to_home.png";
import btnBack from "../utils/buttons/btn_previous.png";

import frame from "../utils/frame.png";
// footbal images
import { f1, f2, f3, f4, f5, f6, f7, f8 } from "../utils/football/index";
import LightBox from "./LightBox";
import { removeBackground } from "../utils/bgRemoval";

const imageData = [
  {
    id: 1,
    src: f1,
    alt: "Description for Image 1",
    role: "gk",
    prompt:
      "capture realistic a high-tension moment where a white male soccer goalkeeper which is alone on field leaps towards the upper corner of the goal in a spectacular save attempt. The focus is on the goalkeeper's face, etched with determination and focus, as they stretch to their limits to block a powerful shot. The background is a blur of the stadium lights and cheering crowd, with the soccer ball frozen in flight, inches from the goalkeeper's fingertips, but not covering face. The scene is lit with the dramatic contrast of stadium lights, highlighting the athleticism and heroism of the moment.",
  },
  {
    id: 2,
    src: f3,
    alt: "Description for Image 1",
    role: "st",
    prompt:
      "white female paying soccer sitting in the middle of stadium alone, holding ball, in frantic action on stadium with flashlights, looking at camera, clear non blocking face ligheted, wide angle. Concept of sport, competition, motion, overcoming",
  },
  {
    id: 3,
    src: f2,
    alt: "Description for Image 2",
    role: "st",
    prompt:
      "white man soccer player standing alone on field, looking at camera, in frantic action on stadium with flashlights, kicking ball for winning goal, clear non blocking, face ligheted, wide angle. Concept of sport, competition, motion, overcoming",
  },
  {
    id: 4,
    src: f5,
    alt: "Description for Image 1",
    role: "st",
    prompt:
      "white soccer player woman stands on field alone, in frantic action on stadium with flashlights, looking at camera while kicking ball, blury background, chasing ball, focus on face which is clear and lighted",
  },
  {
    id: 5,
    src: f4,
    alt: "Description for Image 2",
    role: "st",
    prompt:
      "white soccer player man stands on field alone, in frantic action on stadium with flashlights, looking at camera while kicking ball, blury background, chasing ball, focus on face which is clear and lighted",
  },

  {
    id: 6,
    src: f6,
    alt: "Description for Image 2",
    role: "st",
    prompt:
      "Capture a decisive moment right before a penalty kick in a soccer game. The scene zooms in on the white female player's face which stands on field alone, face should be lighted and clear showing a mix of concentration and calmness, with eyes fixed on the goal. The background features stadium behind, none behind, all blurred to keep the focus on the player. The stadium's lighting casts dramatic shadows, emphasizing the high stakes of the shot, with the soccer ball at the player's feet, ready to be kicked",
  },
  {
    id: 7,
    src: f7,
    alt: "Description for Image 1",
    role: "gk",
    prompt:
      "capture realistic a high-tension moment where a white male soccer goalkeeper which is alone on field, leaps towards the upper corner of the goal in a spectacular save attempt. The focus is on the goalkeeper's face, which is visible and lighted, etched with determination and focus. The background is a blur of the stadium lights and cheering crowd, with the soccer ball frozen in flight, inches from the goalkeeper's fingertips, but not covering face. The scene is lit with the dramatic contrast of stadium lights, highlighting the athleticism and heroism of the moment",
  },
  {
    id: 8,
    src: f8,
    alt: "Description for Image 2",
    role: "gk",
    prompt:
      "capture realistic a high-tension moment where a white female soccer goalkeeper which is alone on field leaps towards the upper corner of the goal in a spectacular save attempt. The focus is on the goalkeeper's face, which is visible and lighted, etched with determination and focus, as they stretch to their limits to block a powerful shot. The background is a blur of the stadium lights and cheering crowd, with the soccer ball frozen in flight, inches from the goalkeeper's fingertips, but not covering face. The scene is lit with the dramatic contrast of stadium lights, highlighting the athleticism and heroism of the moment",
  },
];

const Test = ({ printerId, collectionName }: any) => {
  const [image, setImage] = useState<File | null>(null);
  // for user image preview
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  // enter fields
  const [prompt, setPrompt] = useState<string>("");
  const [name, setName] = useState<string>("name");
  const [email, setEmail] = useState<string>("email");
  // final image state
  // const [resultImage, setResultImage] = useState<string | null>(
  //   "https://storage.googleapis.com/imaginarium-bucket/1710880377727-7455215612621995.jpg"
  // );
  const [resultImage, setResultImage] = useState<string | null>("");
  // easy authentication
  // steps for show previous or next jsx element
  const [step, setStep] = useState(1);
  // input and microphone togle state
  const [isUsingSpeech, setIsUsingSpeech] = useState(false);
  // loading
  const [loading, setLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  // terms and conditions checking
  const [isChecked, setIsChecked] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");
  // check lightbox
  const [isPrintDisabled, setIsPrintDisabled] = useState(false);

  // change prompt input stlye in case of inappropriate prompt
  const [promptInputClass, setPromptInputClass] =
    useState("normal-input-class");
  // <------------------- new states ------------------->
  //  image id
  const [selectedImageId, setSelectedImageId] = useState<
    number | undefined | null
  >(null);
  const [selecterImageRole, setSelecterImageRole] = useState("");

  // disable email button
  const [disableEmail, setDisableEmail] = useState(false);
  // disable print button
  const [disablePrint, setDisablePrint] = useState(false);
  const [negativePrompt, setNegativePrompt] = useState(
    "Bad quality, unfocused, ugly, Bad proportions, Blurry"
  );

  const [stylePreset, setStylePreset] = useState("cinematic");
  // toggle between input and microphone
  const handleToggle = () => {
    setIsUsingSpeech(!isUsingSpeech); // Toggle between input and speech-to-text
  };

  // check lightbox
  const [isOpen, setIsOpen] = useState(false);

  // Handlers for step transitions
  const handleNext = () => {
    if (step < 8) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const openLightbox = () => {
    setIsOpen(true);
  };

  const closeLightbox = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    if (step === 1) {
      setDisableEmail(false);
      setDisablePrint(false);
      // Any other state resets or logic related to moving to step 1
    }
  }, [step]);

  // Function to handle the API response
  const handleResponse = async (response: any) => {
    if (response.ok) {
      const data = await response.json();
      if (data.imageUrl) {
        setResultImage(data.imageUrl);
        toast.dismiss(); // Dismiss the loading toast
        // toast.success("Image generation completed!");
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
          setPromptInputClass("border-2 border-red-700");
          setStep(2);
          break;
        default:
          console.error("Unexpected error:", errorData);
          toast.error("An unexpected error occurred. Please try again later.");
          break;
      }
    }
  };

  //   select image from grid
  const handleSelectImage = (id: number) => {
    setSelectedImageId(id);
    const selectedImage = imageData.find((image) => image.id === id);
    if (selectedImage) {
      setPrompt(selectedImage.prompt);
      setSelecterImageRole(selectedImage.role);
      console.log(selectedImage.prompt);
      console.log(selectedImage.role);
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
    if (!image) {
      setErrorMessage("Image missing");
      return;
    }

    try {
      setLoading(true);
      setPromptInputClass("");
      setErrorMessage("");

      // Remove background from the user's image
      const processedImage = await removeBackground(image);

      if (processedImage.success && processedImage.processedImage) {
        // Background removal was successful and processedImage is not null
        // Create a new FormData object with the processed image
        const formData = new FormData();
        formData.append("userImage", image);
        formData.append("prompt", prompt);
        formData.append("name", name);
        // formData.append("email", email);
        // parameters for stable diffusion
        formData.append("negative_prompt", negativePrompt); // Assuming 'negativePrompt' is collected from user input
        formData.append("style_preset", stylePreset);

        // Add the collection name to the FormData
        formData.append("collectionName", collectionName);
        // Add the role to the FormData
        formData.append("role", selecterImageRole);

        const generateResponse = await fetch(
          "https://abovedigital-1696444393502.ew.r.appspot.com/v1/face-swap",
          // "http://localhost:8080/v1/face-swap",
          {
            method: "POST",
            body: formData,
          }
        );

        if (generateResponse.ok) {
          // Image generation was successful
          await handleResponse(generateResponse);
          setLoading(false);
          setName("");
          setEmail("");
        } else {
          // Image generation failed
          setLoading(false);
          console.error("Image generation failed");
          toast.error("An error occurred while generating the image.");
        }
      } else {
        // Background removal failed or processedImage is null
        setLoading(false);
        console.error("Background removal failed");
        toast.error("An error occurred while removing the background.");
      }
    } catch (error) {
      setLoading(false);
      console.error("Request failed:", error);
      toast.error("An error occurred while processing your request.");
    }
  };

  const handleEmail = async (e: any) => {
    e.preventDefault();
    setDisableEmail(true);
    if (disablePrint) {
      setStep(1); // Navigate to the prompt input step
      setResultImage(null);
      setPrompt("");
      setImage(null);
      setImageUrl(undefined);
      setIsChecked(false);
      setSelectedImageId(null);
    }

    try {
      setEmailLoading(true);

      // Existing code to send email
      const emailResponse = await axios.post(
        "https://abovedigital-1696444393502.ew.r.appspot.com/v1/mail",
        {
          toEmail: email,
          subject: "Unilever Euro 2024",
          message: "Your Generated Image",
          imageUrl: resultImage,
        }
      );

      //   console.log("Email sent successfully", emailResponse.data);

      // Firestore: Find the document with the matching imageUrl
      const imagesCollectionRef = collection(db, collectionName);
      const q = query(
        imagesCollectionRef,
        where("imageUrl", "==", resultImage)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Assuming imageUrl is unique and only one document will match
        const docToUpdate = querySnapshot.docs[0];
        await updateDoc(docToUpdate.ref, {
          name: name,
          email: email,
        });
      } else {
        console.log("No document found with the provided imageUrl");
      }

      // Reset state and proceed
      setEmail("");
      setName("");
      setEmailLoading(false);
      // setStep(5); // Assuming `setStep` updates some state to control UI flow
    } catch (error) {
      console.error("Failed to send email or update document", error);
      toast.error("Failed to send email or update document");
      setEmailLoading(false);
    }
  };

  const handlePrint = async () => {
    setDisablePrint(true);
    if (disableEmail) {
      setStep(1); // Navigate to the prompt input step
      setResultImage(null);
      setPrompt("");
      setImage(null);
      setImageUrl(undefined);
      setIsChecked(false);
      setSelectedImageId(null);
    }
    try {
      // setIsPrintDisabled(true);
      const response = await fetch(
        "https://abovedigital-1696444393502.ew.r.appspot.com/v1/print",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ imageUrl: resultImage, printerId: printerId }),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      toast.success(printerId);
      // Enable the button after 10 seconds
      setTimeout(() => setIsPrintDisabled(false), 10000);
    } catch (error) {
      console.error("There was an error!", error);
    }
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

  return (
    <div className="w-full min-h-screen flex justify-center items-center">
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
          <div className="absolute inset-0 z-20 w-full min-h-screen">
            <Image className="absolute inset-0" src={bg5} alt="bg5" fill />
            <div className="fadeIn relative z-10 flex w-full min-h-screen justify-center items-center flex-col gap-5 pb-80">
              <div className="relative w-1/4">
                <div className="w-full h-16 bg-gray-200 overflow-hidden">
                  <div className="h-full bg-gray-400 progress-bar"></div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* password */}
        {step === 1 && (
          <div className="flex flex-col fadeIn items-center justify-center gap-3 w-full">
            <Image className="absolute inset-0" src={bg1} alt="bg1" fill />
            <button
              onClick={handleNext}
              className="absolute z-10 bottom-1/3 right-[20%]"
            >
              <Image src={btn1} alt="next" width={250} />
            </button>
          </div>
        )}

        {/* upload field */}
        <div className="flex flex-col gap-5 items-center justify-center w-full">
          {/* enter prompt */}
          {step === 2 && (
            <div className="flex fadeIn justify-center flex-col items-center w-full gap-4 p-3">
              <Image className="absolute inset-0" src={bg2} alt="bg1" fill />
              <div className="relative z-10 top-20 flex flex-col items-center justify-center">
                <div className="grid grid-cols-4 gap-4">
                  {imageData.map((image, index) => (
                    <div
                      key={index}
                      className={`w-full relative border-4 ${
                        selectedImageId === image.id
                          ? "border-red-600 rounded-xl"
                          : "border-transparent"
                      }`}
                      onClick={() => handleSelectImage(image.id)}
                    >
                      <Image
                        className="curson-pointer rounded-md"
                        src={image.src}
                        alt={image.alt}
                        width={180}
                        height={200}
                      />
                    </div>
                  ))}
                </div>
                <button
                  disabled={selectedImageId === null}
                  onClick={handleNext}
                  className={`relative top-16 ${
                    selectedImageId === null ? "opacity-50" : "opacity-100"
                  }`}
                >
                  <Image src={btn1} alt="next" width={200} />
                </button>
              </div>
            </div>
          )}
          {/* upload image & submit */}
          {step === 3 &&
            (resultImage ? null : imageUrl ? (
              <div className="flex flex-col gap-10 justify-center items-center">
                <Image className="absolute inset-0" src={bg4} alt="bg4" fill />

                <button
                  onClick={handleBack}
                  disabled={loading}
                  className="absolute w-[300px] h-14 inset-0 z-20 top-1/2 left-24"
                >
                  <Image src={btnBack} alt="bg3" width={250} />
                </button>
                {!loading && (
                  <div className="flex flex-col gap-10 absolute top-1/3 mt-20 right-32">
                    {/* upload again button */}
                    <label className="cursor-pointer">
                      <Image
                        src={btnUploadAgain}
                        alt="camera"
                        width={250}
                        height={30}
                      />

                      {/* prompt input */}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        disabled={loading}
                      />
                    </label>
                    {/* submit api call */}
                    <button onClick={handleSubmit}>
                      <Image src={btn1} alt="next" width={250} />
                    </button>
                  </div>
                )}
                <div className="relative left-16 z-10 w-full flex items-center justify-center mr-28">
                  {!loading && (
                    <img
                      src={imageUrl}
                      alt="Preview"
                      style={{ maxWidth: "450px" }}
                      className="pt-10"
                    />
                  )}
                </div>
              </div>
            ) : (
              // Render the image upload section when neither imageUrl nor resultImage is set
              <div className="flex flex-col xl:gap-[5vmin] lg:gap-[5vmin] md:gap-[8vmin] sm:gap-[5vmin] xs:gap-[10vmin]  fadeIn items-center justify-center w-[250px]">
                <Image className="absolute inset-0" src={bg3} alt="bg3" fill />
                <button
                  onClick={handleBack}
                  disabled={loading}
                  className="absolute w-[300px] h-14 inset-0 z-10 top-1/2 left-24"
                >
                  <Image src={btnBack} alt="bg3" width={250} />
                </button>
                <div className="relative z-20 bottom-28">
                  {/* <Image className="" src={btnUpload} alt="upload" width={80} /> */}
                  <label className="cursor-pointer">
                    <div className="flex flex-col items-center justify-center pt-16">
                      <Image
                        src={btnUpload}
                        alt="camera"
                        width={80}
                        height={80}
                      />
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
                {/* <div className="flex flex-col items-center justify-center gap-3">
                  <div
                    id="alert-1"
                    className={`items-center fadeOut p-4 mb-4 text-white font-bold rounded-lg bg-violet-500  ${
                      isInfoClosed ? "hidden" : "flex"
                    }`}
                    role="alert"
                  >
                    <svg
                      className="flex-shrink-0 w-4 h-4"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                    </svg>
                    <span className="sr-only">Info</span>
                    <div className="ms-3 text-sm text-white">
                      Make sure nothing is covering your face.
                    </div>
                    <button
                      type="button"
                      className="ms-auto -mx-1.5 -my-1.5  text-white rounded-lg focus:ring-2 inline-flex items-center justify-center h-8 w-8"
                      data-dismiss-target="#alert-1"
                      aria-label="Close"
                      onClick={CloseInfo}
                    >
                      <span className="sr-only">Close</span>
                      <svg
                        className="w-3 h-3"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 14 14"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex text-center">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => setIsChecked(e.target.checked)}
                      className="mr-2"
                    />
                    <p className="text-sm">
                      I Agree To{" "}
                      <a
                        href="https://abovedigital.io/privacy-policy/"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span className="text-violet-700 hover:underline decoration-1 cursor-pointer">
                          Terms and Conditions
                        </span>
                      </a>
                    </p>
                  </div>
                  <h1 className="font-bold text-center text-lg">
                    Take Selfie Or Upload Image
                  </h1>
                </div> */}

                <label
                  className={`flex xl:w-[30vmin] lg:w-[30vmin] md:w-[40vmin] sm:w-full xs:w-full flex-col items-center justify-center  rounded-lg text-center`}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Image src={camera} alt="camera" width={40} height={40} />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={!isChecked}
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            ))}

          {step === 4 && resultImage && (
            <>
              <Image className="absolute inset-0" src={bg7} alt="bg7" fill />
              <div className="relative z-10 flex flex-col gap-5 justify-center items-center w-full">
                {/* <div className="flex gap-5 xl:flex-row md:flex-row sm:flex-col xs:flex-col">
                  <button
                    className="flex gap-2 items-center bg-violet-500 hover:bg-violet-700 text-white font-bold py-2 px-4 border border-violet-900 rounded-lg"
                    onClick={startOver}
                  >
                    <Image src={start} alt="start" width={25} height={25} />
                    Start Over
                  </button>
                </div> */}
                <div className="flex flex-col gap-8 w-[42%] pt-44">
                  <input
                    type="name"
                    id="name"
                    className="bg-transparent border-b text-white border-gray-300 text-3xl outline-none"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Όνομα"
                    autoComplete="off"
                  />
                  <input
                    type="email"
                    id="email"
                    className="bg-transparent border-b text-white border-gray-300 text-3xl outline-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email"
                    autoComplete="off"
                  />
                  <button
                    className={`${
                      disableEmail ? "opacity-0" : "opacity-100"
                    } flex gap-2 items-center justify-center  text-white font-bold py-2 px-4 bg-transparent pt-5`}
                    type="button"
                    disabled={!email || !name || emailLoading || disableEmail}
                    onClick={handleEmail}
                  >
                    <Image src={btnSend} alt="btnSend" width={250} />
                  </button>
                  <button
                    className={`${
                      disablePrint ? "opacity-0" : "opacity-100"
                    } flex gap-2 items-center justify-center cursor-pointer  text-white font-bold py-2 px-4 bg-transparent pt-5`}
                    type="button"
                    onClick={handlePrint}
                    disabled={disablePrint}
                  >
                    <Image src={btnPrint} alt="btnSend" width={650} />
                  </button>
                </div>
              </div>
              <div className="relative z-20 flex items-center justify-center w-full h-[150px]">
                <button
                  onClick={startOver}
                  className="w-[500px] h-14 z-10 top-1/2"
                >
                  <Image src={btnBackHome} alt="bg3" width={500} />
                </button>
              </div>
            </>
          )}

          {/* user image preview */}

          {resultImage && step !== 4 && step !== 5 && (
            <div className="absolute w-full min-h-screen">
              <Image className="absolute inset-0" src={bg6} alt="bg6" fill />
              <button
                onClick={handleBack}
                disabled={loading}
                className="absolute w-[300px] h-14 inset-0 z-10 top-1/2 left-24"
              >
                <Image src={btnBack} alt="bg3" width={250} />
              </button>
              <div className="relative flex pt-20 items-center justify-center z-10 min-h-screen">
                <div className="absolute pb-10 h-1/2">
                  {/* The image that you want to show inside the frame */}
                  <Image
                    className="rounded-lg"
                    width={430}
                    height={430}
                    src={`${resultImage}`}
                    alt="Result"
                    onClick={() => openLightbox()}
                  />
                  {isOpen && (
                    <LightBox isOpen={isOpen} onClose={closeLightbox}>
                      <Image
                        className="rounded-lg"
                        width={670}
                        height={400}
                        src={resultImage}
                        alt="Result"
                      />
                    </LightBox>
                  )}
                </div>
                <button
                  disabled={selectedImageId === null}
                  onClick={handleNext}
                  className="absolute left-3/4"
                >
                  <Image src={btn1} alt="next" width={250} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* <div className="flex"> */}
      {/* {step === 5 && (
        <div className="absolute inset-0 z-10 w-full min-h-screen">
          <Image className="absolute inset-0" src={bg8} alt="bg8" fill />

          <button onClick={startOver}>
            <Image
              className="absolute right-[22%] bottom-[45%]"
              src={startAgain}
              alt="start again"
            />
          </button>
        </div>
      )} */}
      {/* </div> */}
      {/* Navigation Buttons */}
      {/* <div className="flex gap-5 pb-5 pt-2">
        {step > 1 && (step !== 2 || !isAuthorized) && !resultImage && (
          <button
            className={`${
              loading
                ? "bg-violet-300 cursor-not-allowed"
                : "bg-violet-500 hover:bg-violet-700"
            } text-white font-bold py-2 px-4 border border-violet-900 rounded-lg w-[90px]`}
            onClick={handleBack}
            disabled={loading}
          >
            Back
          </button>
        )}
        {step < 3 && !resultImage && (
          <button
            className={`py-2 px-4 border border-violet-900 rounded-lg w-[90px] font-bold ${
              (step === 1 && !isAuthorized) ||
              (step === 2 && prompt.trim() === "") ||
              (step === 3 && !imageUrl)
                ? "bg-violet-300 text-white cursor-not-allowed"
                : "bg-violet-500 hover:bg-violet-700 text-white"
            }`}
            onClick={handleNext}
            disabled={
              (step === 1 && !isAuthorized) ||
              (step === 2 && prompt.trim() === "") ||
              (step === 3 && !imageUrl)
            }
          >
            Next
          </button>
        )}
        {step === 3 && !resultImage && (
          <button
            className={`  text-white font-bold py-2 px-4 border border-violet-900 rounded-lg ${
              loading
                ? "cursor-not-allowed bg-violet-300"
                : "cursor-pointer bg-violet-500 hover:bg-violet-700"
            }`}
            onClick={isAuthorized ? handleSubmit : authorizeError}
            disabled={!isAuthorized || loading}
          >
            Submit
          </button>
        )}
      </div> */}
    </div>
  );
};

export default Test;
