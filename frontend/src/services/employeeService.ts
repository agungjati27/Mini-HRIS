import api from "../api/axiosClient";


export async function getEmployeeProfile(){

const response =
await api.get(
"/employee/profile"
);


return response.data;

}