import { launchImageLibrary } from 'react-native-image-picker';

export const openGallery = () => {
    launchImageLibrary(
        {
            mediaType: "photo",
            selectionLimit: 10
        }
    )
}
console.log("Upplod photo", openGallery)