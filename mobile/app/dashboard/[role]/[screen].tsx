import { Redirect, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import RoleShell from '../../../components/RoleShell';
import RoleScreen from '../../../components/RoleScreen';
export default function ScreenRoute(){const {role,screen}=useLocalSearchParams<{role:string;screen:string}>();const {user,isAuthenticated,isHydrating}=useAuth();if(isHydrating)return null;if(!isAuthenticated||!user)return <Redirect href="/login"/>;if(role?.toUpperCase()!==user.role)return <Redirect href={`/dashboard/${user.role.toLowerCase()}`}/>;return <RoleShell><RoleScreen screen={screen||'dashboard'}/></RoleShell>;}
