import POEData from '../../resources/data/data.json'


export function getAreaList(){
    const arealist:any = []

    POEData.acts.forEach((element:any) => { 
        //console.log(element)
        //console.log("arealist[" + element.actid + "] = " + element.act)
        arealist[element.actid] = element.act
    })

    return arealist
}

