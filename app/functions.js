
export const convertDateToJsonString =(inputDate)=>{
    if(inputDate<1){
        throw new Error("Invalid Date!");
    }

    const jsonDate = inputDate.getFullYear() + "-" +String(inputDate.getMonth() + 1).padStart(2, '0') + "-" +String(inputDate.getDate()).padStart(2, '0');

    return jsonDate;
}

export const convertDateToDisplayString =(outputDate)=>{
    if(outputDate<1){
        throw new Error("Invalid Date!");
    }

    const objDate=new Date(outputDate);
    const result = String(objDate.getDate()).padStart(2, '0')+"/"+String(objDate.getMonth() + 1).padStart(2, '0')+"/"+objDate.getFullYear();

    return result;
}