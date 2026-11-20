import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import Splash from "./screens/splash";
import OnboardingScreen from "./screens/onboarding";
import TodayTasksScreen from "./screens/todayTasks";
import TaskGuideScreen from "./screens/taskGuide";
import RecordingScreen from "./screens/recording";
import ResultScreen from "./screens/result";
import TimelineScreen from "./screens/timeline";
import ChartsScreen from "./screens/charts";
import ClinicSummaryScreen from "./screens/clinicSummary";
import DoctorPatientsScreen from "./screens/doctor/patients";
import PatientDetailScreen from "./screens/doctor/patientDetail";
import DoctorInviteScreen from "./screens/doctor/invite";
import DoctorAppointmentsScreen from "./screens/doctor/appointments";
import ReplayScreen from "./screens/replay";
import DoctorTodayScreen from "./screens/doctor/today";
import DoctorSceneScreen from "./screens/doctor/scene";
import DoctorMeScreen from "./screens/doctor/me";
import { useChildStore } from "./store/child";
import { LoginScreen, SignupDoneScreen, SignupScreen, StartScreen, TermsScreen } from "./screens/auth";

const SPLASH_MS = 1200;

/** 아이 정보가 있으면 오늘의 과제, 없으면 시작(회원가입·로그인) 화면 */
function StartRedirect() {
  const profile = useChildStore((s) => s.profile);
  return <Navigate to={profile ? "/tasks" : "/start"} replace />;
}

export default function App() {
  // 앱을 열 때 로고 화면을 잠깐 보여 줌
  const [splash, setSplash] = useState(true);
  useEffect(() => {
    const t = window.setTimeout(() => setSplash(false), SPLASH_MS);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <BrowserRouter>
      {splash && <Splash />}
      <Routes>
        {/* 시작: 역할 선택 없이 보호자 화면으로 (의사는 병원용 프로그램으로 분리) */}
        <Route path="/" element={<StartRedirect />} />

        {/* 회원가입 · 로그인 (서버 연결 전: 화면 흐름만) */}
        <Route path="/start"               element={<StartScreen />} />
        <Route path="/signup"              element={<SignupScreen />} />
        <Route path="/signup/done"         element={<SignupDoneScreen />} />
        <Route path="/signup/terms"        element={<TermsScreen />} />
        <Route path="/login"               element={<LoginScreen />} />

        {/* 부모 앱 */}
        <Route path="/onboarding"          element={<OnboardingScreen />} />
        <Route path="/tasks"               element={<TodayTasksScreen />} />
        <Route path="/task-guide/:taskType" element={<TaskGuideScreen />} />
        <Route path="/recording/:taskType"  element={<RecordingScreen />} />
        <Route path="/result/:taskType"     element={<ResultScreen />} />
        <Route path="/timeline"            element={<TimelineScreen />} />
        <Route path="/charts"              element={<ChartsScreen />} />
        <Route path="/clinic-summary"      element={<ClinicSummaryScreen />} />
        <Route path="/replay/:sessionId"   element={<ReplayScreen />} />

        {/* 의사 앱 */}
        <Route path="/doctor"                element={<DoctorTodayScreen />} />
        <Route path="/doctor/patients"       element={<DoctorPatientsScreen />} />
        <Route path="/doctor/patients/:id"   element={<PatientDetailScreen />} />
        <Route path="/doctor/patients/:id/scene/:recordId" element={<DoctorSceneScreen />} />
        <Route path="/doctor/invite"         element={<DoctorInviteScreen />} />
        <Route path="/doctor/appointments"   element={<DoctorAppointmentsScreen />} />
        <Route path="/doctor/me"             element={<DoctorMeScreen />} />
      </Routes>
    </BrowserRouter>
  );
}
