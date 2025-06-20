import DashboardLayout from '@/layout/DashboardLayout'
import UserLayout from '@/layout/UserLayout'
import React from 'react'

export default function Profile() {
  return (
   <UserLayout>
   <DashboardLayout>
    <h1>Profile</h1>
   </DashboardLayout>
   </UserLayout>
  )
}
