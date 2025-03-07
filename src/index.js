import React from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
} from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from "./components/Navbar";
import SeaSurfaceTemperature from "./routes/SeaSurfaceTemperature";
import SeaSurfaceCurrents from "./routes/SeaSurfaceCurrents";
import SeaSurfaceHeight from "./routes/SeaSurfaceHeight";
import SeaSurfaceSalinity from "./routes/SeaSurfaceSalinity";
import SeaSurfaceTempAnomaly from "./routes/SeaSurfaceTempAnomaly";
import PrecipitationRate from "./routes/PrecipitationRate";
import EnergyBudget from "./routes/EnergyBudget";
import WeatherPatterns from "./routes/WeatherPatterns";
import ClimateZones from "./routes/ClimateZones";
import ClimateState from "./routes/ClimateState";
import Simex from "./routes/Simex";
import IODIndianMonsoon from "./routes/IODIndianMonsoon";
import MaddenJulianOscillation from "./routes/MaddenJullianOscillation";
import InterTropicalConvergenceZone from "./routes/InterTropicalConvergenceZones";
import Climate from "./routes/Climate";
import "./App.css";
import video from './assets/bg-video1.mp4'
import { NavbarProvider, useNavbar } from './components/NavbarContext';
import GlobalSatelliteFeed from "./routes/GlobalSatelliteFeed";

const AppLayout = () => {
  const { navBackgroundColor } = useNavbar();

  return (
    <>
      <div className="background">
        <video
          className="background-video"
          width="100%"
          height="auto"
          autoPlay
          muted
          loop
          controls
        >
          <source src={video} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <Navbar backgroundColor={navBackgroundColor} />
        <Outlet />
      </div>
    </>
  );
};

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: '/',
        element: <ClimateZones />,
      },
      {
        path: "/sst",
        element: <SeaSurfaceTemperature />,
      },
      {
        path: "/ssc",
        element: <SeaSurfaceCurrents />,
      },
      {
        path: "/ssh",
        element: <SeaSurfaceHeight />,
      },
      {
        path: "/sss",
        element: <SeaSurfaceSalinity />,
      },
      {
        path: "/ssta",
        element: <SeaSurfaceTempAnomaly />,
      },
      {
        path: "/precipitation-rate",
        element: <PrecipitationRate />,
      },
      {
        path: "/energy-budget",
        element: <EnergyBudget />,
      },
      {
        path: "/weather-patterns",
        element: <WeatherPatterns />,
      },
      {
        path: '/climate',
        element: <Climate />,
      },
      {
        path: '/climate-state',
        element: <ClimateState />,
      },
      {
        path: '/simex',
        element: <Simex />,
      },
      {
        path: '/iodim',
        element: <IODIndianMonsoon />,
      },
      {
        path: "/mjo",
        element: <MaddenJulianOscillation />,
      },
      {
        path: "/itcz",
        element: <InterTropicalConvergenceZone />,
      },
      {
        path: "/feed",
        element: <GlobalSatelliteFeed />,

      }
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <NavbarProvider>
    <RouterProvider router={router} />
  </NavbarProvider>
);
