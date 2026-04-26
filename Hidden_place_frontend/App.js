import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import your screens
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
import AddPlaceScreen from './screens/AddPlaceScreen';
import PlaceDetailsScreen from './screens/PlaceDetailsScreen';
import AddReviewScreen from './screens/AddReviewScreen';
import GuidesListScreen from './screens/GuidesListScreen';
import RegisterGuideScreen from './screens/RegisterGuideScreen';
import MyTripsScreen from './screens/MyTripsScreen';
import CreateTripScreen from './screens/CreateTripScreen';
import CategoriesScreen from './screens/CategoriesScreen';
import UploadMediaScreen from './screens/UploadMediaScreen';
import ProfileScreen from './screens/ProfileScreen';
import EditPlaceScreen from './screens/EditPlaceScreen';
import ManageGuidesScreen from './screens/ManageGuidesScreen';
import TripDetailsScreen from './screens/TripDetailsScreen';
import GuideDetailsScreen from './screens/GuideDetailsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="Home" component={HomeScreen} /> 
        <Stack.Screen name="AddPlace" component={AddPlaceScreen} />
        <Stack.Screen name="PlaceDetails" component={PlaceDetailsScreen} />
        <Stack.Screen name="AddReview" component={AddReviewScreen} />
        <Stack.Screen name="GuidesList" component={GuidesListScreen} />
        <Stack.Screen name="RegisterGuide" component={RegisterGuideScreen} />
        <Stack.Screen name="MyTrips" component={MyTripsScreen} />
        <Stack.Screen name="CreateTrip" component={CreateTripScreen} />
        <Stack.Screen name="Categories" component={CategoriesScreen} />
        <Stack.Screen name="UploadMedia" component={UploadMediaScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="EditPlace" component={EditPlaceScreen} />
        <Stack.Screen name="ManageGuides" component={ManageGuidesScreen} />
        <Stack.Screen name="TripDetails" component={TripDetailsScreen} />
        <Stack.Screen name="GuideDetails" component={GuideDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}