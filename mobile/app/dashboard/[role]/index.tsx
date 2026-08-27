import { Redirect, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import RoleShell from '../../../components/RoleShell';
import RoleScreen from '../../../components/RoleScreen';
import type { UserRole } from '../../../types/auth';
export default function RoleIndex(){const {role}=useLocalSearchParams<{role:string}>();const {user,isAuthenticated,isHydrating}=useAuth();if(isHydrating)return null;if(!isAuthenticated||!user)return <Redirect href="/login"/>;const r=role?.toUpperCase() as UserRole;if(r!==user.role)return <Redirect href={`/dashboard/${user.role.toLowerCase()}`}/>;return <RoleShell><RoleScreen screen="dashboard"/></RoleShell>;}
