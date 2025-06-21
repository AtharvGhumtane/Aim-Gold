import React, { useEffect } from 'react'
import UserLayout from '@/layout/UserLayout'
import DashboardLayout from '@/layout/DashboardLayout'
import { connect, useDispatch, useSelector } from 'react-redux'
import { AcceptConnection, getMyConnectionRequests } from '@/config/redux/action/authAction';
import { BASE_URL } from '@/config';
import styles from "./index.module.css"
import { useRouter } from 'next/router';



export default function MyConnectionsPage() {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const router = useRouter();
  useEffect(() => {
    dispatch(getMyConnectionRequests({token:localStorage.getItem("token")}));
  },[])
  useEffect(() => {
    if(authState.connectionRequest){
        console.log(authState.connectionRequest.length != 0)
    }
  },[authState.connectionRequest])



  return (
    <UserLayout>
      <DashboardLayout>
         <div style={{display:"flex" , flexDirection:"column"}}>
            <h1>My Connections</h1>

            {authState.connectionRequest.length ===0 && <h3>No Connection Requests</h3>}
              {
                authState.connectionRequest.length != 0 && authState.connectionRequest.filter((connection) => connection.status_accepted === null).map((user,index) => {
                    return(
                        <div onClick={() => {
                            router.push(`/view_profile/${user.userId.username}`)
                        }} className={styles.userCard} key={index}>
                            <div style={{display:"flex" , alignItems:"center" ,gap:"1.2rem" , justifyContent:"space-between"}}>
                               <div className={styles.profilePicture}>
                                   <img src={`${BASE_URL}/uploads/${user.userId.profilePicture}`} alt="" />
                               </div>
                               <div className={styles.userInfo}>
                                    <h3>{user.userId.name}</h3>
                                    <p>{user.userId.username}</p>
                               </div>
                               <button onClick={(e) => {
                                e.stopPropagation();
                                dispatch(AcceptConnection({
                                    requestId: user._id,
                                    token: localStorage.getItem("token"),
                                    action:"accept" 
                                }))
                               }} className={styles.connectedButton}>Accept</button>
                            </div>
                        </div>
                    )
                })
              }

              <h3>My Network</h3>
              
              {authState.connectionRequest.filter((connection) => connection.status_accepted !== null).map((user,index) => {
                return(
                        <div onClick={() => {
                            router.push(`/view_profile/${user.userId.username}`)
                        }} className={styles.userCard} key={index}>
                            <div style={{display:"flex" , alignItems:"center" ,gap:"1.2rem" , justifyContent:"space-between"}}>
                               <div className={styles.profilePicture}>
                                   <img src={`${BASE_URL}/uploads/${user.userId.profilePicture}`} alt="" />
                               </div>
                               <div className={styles.userInfo}>
                                    <h3>{user.userId.name}</h3>
                                    <p>{user.userId.username}</p>
                               </div>

                            </div>
                        </div>)
              })}
              
         </div>
      </DashboardLayout>
    </UserLayout>
  )
}




