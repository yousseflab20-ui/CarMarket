import API from "../api"

export const getFAQ = async () => {
    const response = await API.get("settings/getfaq")
    return response.data
}