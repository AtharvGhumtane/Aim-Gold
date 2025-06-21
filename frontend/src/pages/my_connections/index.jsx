import React, { useEffect } from 'react'
import UserLayout from '@/layout/UserLayout'
import DashboardLayout from '@/layout/DashboardLayout'
import { connect, useDispatch, useSelector } from 'react-redux'
import { AcceptConnection, getMyConnectionRequests, getConnectionRequest } from '@/config/redux/action/authAction';
import { BASE_URL } from '@/config';
import styles from "./index.module.css"
import { useRouter } from 'next/router';

export default function MyConnectionsPage() {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    // Fetch both connection requests and existing connections
    dispatch(getMyConnectionRequests({token:localStorage.getItem("token")}));
    dispatch(getConnectionRequest({token:localStorage.getItem("token")}));
  },[])

  useEffect(() => {
    if(authState.connectionRequest){
        console.log(authState.connectionRequest.length != 0)
    }
  },[authState.connectionRequest])

  // Helper function to handle connection acceptance
  const handleAcceptConnection = async (e, user) => {
    e.stopPropagation();
    await dispatch(AcceptConnection({
        requestId: user._id,
        token: localStorage.getItem("token"),
        action:"accept" 
    }));
    
    // Refresh the data after accepting
    setTimeout(() => {
      dispatch(getMyConnectionRequests({token:localStorage.getItem("token")}));
      dispatch(getConnectionRequest({token:localStorage.getItem("token")}));
    }, 1000); // Give some time for the backend to process
  };

  // Get pending requests (not accepted yet) - these are requests I RECEIVED
  const pendingRequests = authState.connectionRequest ? 
    authState.connectionRequest.filter((connection) => connection.status_accepted === null || connection.status_accepted === false) : [];

  // ✅ FIXED: Get all accepted connections from both arrays
  const getAcceptedConnections = () => {
    const acceptedConnections = [];
    
    // Get accepted connections from connectionRequest (requests I received and accepted)
    if (authState.connectionRequest && Array.isArray(authState.connectionRequest)) {
      const acceptedFromRequests = authState.connectionRequest
        .filter(connection => connection.status_accepted === true)
        .map(connection => ({
          ...connection,
          otherUser: connection.userId, // The person who sent me the request
          connectionType: 'received'
        }));
      acceptedConnections.push(...acceptedFromRequests);
    }

    // Get accepted connections from connection array (requests I sent that were accepted)
    if (authState.connection && Array.isArray(authState.connection)) {
      const acceptedFromConnections = authState.connection
        .filter(connection => connection.status_accepted === true)
        .map(connection => ({
          ...connection,
          otherUser: connection.connectionId, // The person I sent the request to
          connectionType: 'sent'
        }));
      acceptedConnections.push(...acceptedFromConnections);
    }

    // Remove duplicates based on user ID
    const uniqueConnections = acceptedConnections.filter((connection, index, self) => {
      const currentUserId = connection.otherUser?._id;
      return index === self.findIndex(c => c.otherUser?._id === currentUserId);
    });

    return uniqueConnections;
  };

  const allAcceptedConnections = getAcceptedConnections();

  return (
    <UserLayout>
      <DashboardLayout>
         <div style={{display:"flex" , flexDirection:"column"}}>
            <h1>My Connections</h1>

            {pendingRequests.length === 0 && <h3>No Connection Requests</h3>}
            
            {pendingRequests.length > 0 && pendingRequests.map((user,index) => {
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
                           <button onClick={(e) => handleAcceptConnection(e, user)} className={styles.connectedButton}>
                             Accept
                           </button>
                        </div>
                    </div>
                )
            })}

            <h3>My Network</h3>
            
            {allAcceptedConnections.length === 0 && <p>No connections yet</p>}
            
            {allAcceptedConnections.map((connection, index) => {
              // ✅ FIXED: Use the otherUser property we set above
              const userToShow = connection.otherUser;
              
              if (!userToShow) return null; // Safety check
              
              return(
                <div onClick={() => {
                    router.push(`/view_profile/${userToShow.username}`)
                }} className={styles.userCard} key={index}>
                    <div style={{display:"flex" , alignItems:"center" ,gap:"1.2rem" , justifyContent:"space-between"}}>
                       <div className={styles.profilePicture}>
                           <img src={`${BASE_URL}/uploads/${userToShow.profilePicture}`} alt="" />
                       </div>
                       <div className={styles.userInfo}>
                            <h3>{userToShow.name}</h3>
                            <p>{userToShow.username}</p>
                       </div>
                       <span className={styles.connectedStatus}>Connected</span>
                    </div>
                </div>
              )
            })}
              
         </div>
      </DashboardLayout>
    </UserLayout>
  )
}