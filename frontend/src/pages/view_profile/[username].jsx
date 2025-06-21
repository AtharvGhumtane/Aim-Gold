import { BASE_URL, clientServer } from '@/config';
import DashboardLayout from '@/layout/DashboardLayout';
import UserLayout from '@/layout/UserLayout';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import styles from "./index.module.css"
import { getAllPosts } from '@/config/redux/action/postAction';
import { getConnectionRequest,sendConnectionsRequest } from '@/config/redux/action/authAction';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';

export default function ViewProfilePage({userProfile}) {
  const router = useRouter();

  // ✅ FIXED: Use correct selector names matching your store configuration
  const postReducer = useSelector((state) => state.posts); // Changed from state.postReducer
  const authState = useSelector((state) => state.auth);     // Changed from state.authState

  const dispatch = useDispatch();

  const [userPosts,setUserPosts] = useState([]);
  const [isCurrentUserInConnection,setIsCurrentUserInConnection] = useState(false);
  const[isConnectionNull,setIsConnectionNull] = useState(true);
  const getUsersPost = async () => {
    await dispatch(getAllPosts());
    await dispatch(getConnectionRequest({token:localStorage.getItem("token")}))
  }

  useEffect(() => {
    // ✅ FIXED: Add safety check to prevent error when posts is undefined
    if (postReducer.posts && Array.isArray(postReducer.posts)) {
      let post = postReducer.posts.filter((post) => {
        return post.userId.username === router.query.username
      })
      setUserPosts(post);
    }
  },[postReducer.posts])
  
  useEffect(() => {
    console.log(authState.connection, userProfile?.userId?._id)
    // ✅ FIXED: Add safety checks to prevent errors
    if(authState.connection && Array.isArray(authState.connection) && userProfile?.userId?._id) {
      if(authState.connection.some(user => user.connectionId._id === userProfile.userId._id)){
        setIsCurrentUserInConnection(true)
        if(authState.connection.find(user => user.connectionId._id === userProfile.userId._id).status_accepted === true){
          setIsConnectionNull(false)
        }
      }
    }
  },[authState.connection])
  
  useEffect(() => {
    getUsersPost();
  },[])
  

  const searchParamers = useSearchParams();

  // ✅ FIXED: Add safety check for userProfile
  if (!userProfile) {
    return (
      <UserLayout>
        <DashboardLayout>
          <div>Profile not found</div>
        </DashboardLayout>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
       <DashboardLayout>

          <div className={styles.container}>
              <div className={styles.backDropContainer}>
                <img className={styles.backDrop} src={  !userProfile.userId.profilePicture || userProfile.userId?.profilePicture === 'default.jpg'
                                ? `${BASE_URL}/uploads/default.jpg`
                                : `${BASE_URL}/uploads/${userProfile.userId.profilePicture}` // ✅ FIXED: Changed from 'user' to 'userProfile'
                             } alt="backdrop" />
              </div>
              <div className='workHistory'>
                 <h1>Sport History</h1>
                 <div className={styles.workHistoryContainer}>
                    {
                      userProfile.pastWork.map((work,index) => {
                        return(
                          <div key={index} className={styles.workHistoryCard}>
                             <p style={{fontWeight:"bold",display:"flex",alignItems:"center",gap:"0.8rem"}}>Club :- {work.company}</p>
                             <p>Position :- {work.position}</p>
                             <p>Playing since :- {work.years}</p>
                          </div>
                        )
                      })
                    }
                 </div>
              </div>

              <div className={styles.profileContainer__details}> 

                <div style={{display:"flex",gap:"0.7rem"}}>
                  <div style={{flex:"0.8"}}>
                    <div style={{display:"flex",width:"fit-content",alignItems:"center",gap:"1.2rem"}}>
                      <h2>{userProfile.userId.name}</h2>
                      <p style={{color:"grey"}}>@{userProfile.userId.username}</p>
                    </div>

                    {/*--------------------- */}
                    <div style={{display:"flex" , alignItems:"center" , gap:"1.2em"}}>
                    {isCurrentUserInConnection ? 
                      <button className={styles.connectedButton}>{isConnectionNull ? "Pending" : "Connected" }</button>
                      : 
                      <button
                      onClick={() => {
                        dispatch(sendConnectionsRequest({token:localStorage.getItem("token"),user_id: userProfile.userId._id}))
                      }} className={styles.connectBtn}
                      >Connect</button>
                    }
                    <div
                        onClick={async () => {
                        try {
                        const response = await clientServer.get(`/user/download_resume?id=${userProfile.userId._id}`);
                        window.open(`${BASE_URL}/uploads/${response.data.message}`, "_blank");
                        } catch (error) {
                        console.error("Failed to download resume:", error);
                        }
                        }}
                        style={{ cursor: "pointer" }}
                    >
                        <svg
                        style={{ width: "1.2em" }}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="size-6"
                        >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M7.5 7.5h-.75A2.25 2.25 0 0 0 4.5 9.75v7.5a2.25 2.25 0 0 0 2.25 2.25h7.5a2.25 2.25 0 0 0 2.25-2.25v-7.5a2.25 2.25 0 0 0-2.25-2.25h-.75m-6 3.75 3 3m0 0 3-3m-3 3V1.5m6 9h.75a2.25 2.25 0 0 1 2.25 2.25v7.5a2.25 2.25 0 0 1-2.25 2.25h-7.5a2.25 2.25 0 0 1-2.25-2.25v-.75"
                        />
                        </svg>
                    </div>


                    
                    </div>
                    {/*---------------------- */}

                    <div>
                      <p>{userProfile.bio}</p>
                    </div>

                  </div>
                  <div style={{flex:"0.2"}}>
                         <h3>Recent Activity</h3>
                         {userPosts.map((post) => {
                            return (
                              <div key={post._id} className={styles.postCard}>
                                  <div className={styles.card}>
                                    <div className={styles.card__profileContainer}>
                                       {
                                       post.media !== "" ? <img src={`${BASE_URL}/uploads/${post.media}`} alt={`Post by ${post.userId.username}`} />
                                       : <div style={{width:"3.4rem",height:"3.4"}}></div>
                                       }
                                      </div>
                                      <p>{post.body}</p>
                                  </div>
                              </div>
                            )
                         })}
                  </div>

                 </div>
              </div>
            </div> 
        

       </DashboardLayout>
    </UserLayout>
  )
}


export async function getServerSideProps(context) {
  try {
    const res = await clientServer.get(`/user/get_profile_based_on_username`, {
      params: {
        username: context.params.username
      }
    });

    return {
      props: {
        userProfile: res.data.profile || null
      }
    };
  } catch (err) {
    console.error("Error fetching profile:", err.message);
    return {
      props: {
        userProfile: null
      }
    };
  }
}
