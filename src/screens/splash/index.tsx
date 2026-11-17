/** 앱을 처음 열 때 잠깐 보이는 로고 화면 (Figma: 와이어프레임 페이지의 로고 프레임) */
export default function Splash() {
  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-white">
      <img src="/images/logo-mark.png" alt="" className="h-[92px] w-auto" />
      <img src="/images/logo-wordmark.png" alt="베베뷰" className="-mt-1 h-[71px] w-auto" />
    </div>
  );
}
