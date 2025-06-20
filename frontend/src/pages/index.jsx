import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google"; // ✅ add this import
import { Geist, Geist_Mono } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useRouter } from "next/router";
import UserLayout from "@/layout/UserLayout";


const inter = Inter({ subsets: ["latin"] }); // ✅ add this

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {

 const router = useRouter();

  return (
    <UserLayout>
      <div className={styles.container}>

         <div className={styles.mainContainer}>
             
             <div className={styles.mainContainer_left}>
                 <h1>Connect Compete Conquer..</h1>
                 <p>
                     The Ultimate sports networking platform where athletes, coaches,
                     and sports professionals unite to build their careers and chase their dreams
                  </p>

                 <div onClick={() => {
                    router.push("/login")
                 }} className={styles.buttonJoin}>
                  <p>Connect Now</p>
                 </div>
             </div>

             <div className={styles.mainContainer_right}>
                  <Image src="/images/homemain_connection.png" alt="Home connection" width={700} height={500} />

             </div>
          
         </div>

      </div>
    </UserLayout>
  );
}
