import '../styles/globals.css';
import { motion } from 'framer-motion';
import Logo from '../components/Logo';
import LoadingScreen from '../components/LoadingScreen';

export default function App({ Component, pageProps }: any) {
  return (
    <>
      <LoadingScreen />
      <div className="bg-black text-white font-sans min-h-screen">
        <Logo />
        <Component {...pageProps} />
      </div>
    </>
  );
}