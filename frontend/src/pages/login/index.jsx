import UserLayout from '@/layout/UserLayout'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { useSelector , useDispatch } from 'react-redux'
import styles from "./style.module.css"
import { loginUser, registerUser } from '@/config/redux/action/authAction'
import { emptyMessage } from '@/config/redux/reducer/authReducer'



export default function LoginComponent(){
  //if user is looged in to push him on direct dashboard
  const authState = useSelector((state) => state.auth)

  const router = useRouter();

  const dispatch = useDispatch();

  const [userLoginMethod , setUserLoginMethod] = useState(false);

  const [email,setEmailAddress] = useState("");
  const [password,setPassword] = useState("");
  const [username,setUsername] = useState("");
  const [name,setName] = useState("");
  useEffect(() => {
    if (authState.loggedIn) {
        router.push("/dashboard");
    }
  }, [authState.loggedIn]);

  useEffect(() => {
    if(localStorage.getItem("token")){
      router.push("/dashboard");
    }
  }, [])

  useEffect(() => {
    dispatch(emptyMessage());
  }, [userLoginMethod]);




  const handleRegister = () => {
      dispatch(registerUser({username,password,email,name}))
  }
  const handleLogin = () => {
      dispatch(loginUser({email,password}))
  }
  return (
    <UserLayout>
      


      <div className={styles.container}>
      <div className={styles.cardContainer}>
        <div className={styles.cardContainer_Left}>

             <p className={styles.cardleft_heading}>{userLoginMethod ? "Sign In" : "Sign Up"}</p>
             <br />
             <p style={{color : authState.isError ? "red" : "green"}}>{authState.message.message}</p>
             <br />
             <div className={styles.inputContainers}>

              {!userLoginMethod && <div className={styles.inputRow}>
                  <input onChange={(e)=> setUsername(e.target.value)} className={styles.inputField} type="text" placeholder='username'/>
                  <input onChange={(e)=> setName(e.target.value)} className={styles.inputField} type="text" placeholder='name'/>
              </div> }
                 <input onChange={(e)=> setEmailAddress(e.target.value)} className={styles.inputField} type="text" placeholder='email'/>
                 <input onChange={(e)=> setPassword(e.target.value)} className={styles.inputField} type="password" placeholder='password'/>
                 <div onClick={() => {
                  if(userLoginMethod){
                      handleLogin();
                  }else{
                      handleRegister();
                  }
                 }} className={styles.buttonWithOutline}>
                  <p>{userLoginMethod ? "Sign In" : "Sign Up"}</p>
                 </div>
             </div>
        </div>
        <div className={styles.cardContainer_Right}>
            <p className={styles.toggleText}>
                {userLoginMethod
                  ? "Don't have an account?"
                  : "Already have an account?"
                }
            </p>
            <div
                className={styles.toggleButton}
                onClick={() => setUserLoginMethod(!userLoginMethod)}
            >
                {userLoginMethod ? "Sign Up" : "Sign In"}
            </div>
        </div>

         
      </div>
      </div>
    </UserLayout>
  )
}
