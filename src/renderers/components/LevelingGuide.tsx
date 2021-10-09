import React, { useState, useEffect } from "react"

export default function LevelingGuide(props: any) {
    const initActs:InitAct[] = props.acts

    const [curActID, setcurActID] = useState(1)
    const [curZoneID, setcurZoneID] = useState('')

    function findCurAct(actid: number){
        return initActs.find((e) => {
            return e.actid === actid
            })
    }

    function findCurZone(actid: number, zoneid: string){
        const curAct = findCurAct(actid)

        const curzone = curAct.zones.find((e) => {
            console.log("find curzone : "+e.level+"-"+e.name+"==="+zoneid)
            return ((e.level+"-"+e.name) === zoneid)
            })

        if ( curzone === undefined) {
            setcurZoneID(curAct.zones[0].level+"-"+curAct.zones[0].name)
            console.log("not found, return:")
            console.log(curAct.zones[0])
            return curAct.zones[0]
        }
        else{
            console.log(curzone)
            return curzone
        }
    }

    // console.log("in guide")
    // console.log(initActs)

    // useEffect(() => {
    //     setcurZone(findCurZone())
    //     console.log("effect")

    //     return () => {
    //         ''
    //     }
    // }, [curActID])


    function handleActChange(e: React.ChangeEvent<HTMLSelectElement>) {
        console.log("onchange act")
        setcurActID(Number(e.target.value));
    }

    function handleZoneChange(e: React.ChangeEvent<HTMLSelectElement>) {
        setcurZoneID(e.target.value);
    }

    return(
        <div>
        <div className="container">
            <div className="flex flex-row flex-nowrap px-5 py-2 space-x-2">
                {/* <div className="h-10 w-10 shadow-lg rounded-md border-2 p-1"> - </div>
                <div className="h-10 w-10 shadow-lg rounded-md border-2 p-1"> + </div> */}
                <div className="lvlg-map-feature flex-grow">
                    <label> Acte </label>
                    <select className="flex-grow" value={curActID} onChange={handleActChange}>
                        {
                            initActs.map(function(act:InitAct){
                                return( <option key={act.actid} value={act.actid} >{act.act}</option> )
                            })
                        }
                    </select>
                </div>
                <div className="lvlg-map-feature flex-grow">
                    <label> Zone</label>
                    <select className="flex-grow" value={curZoneID} onChange={handleZoneChange}>
                        {                            
                            // curAct.zones.map(function(zone:InitZone){
                            //     return( <option key={zone.level+"-"+zone.name} value={zone.level+"-"+zone.name} >{zone.name}</option> )
                            // })

                            findCurAct(curActID).zones.map(function(zone:InitZone){
                                return( <option key={zone.level+"-"+zone.name} value={zone.level+"-"+zone.name} >{zone.name}</option> )
                            })

                            
                        }
                    </select>

                </div>
                <div className="lvlg-map-feature enabled text-center"> Level <p className="text-xxl text-poe-50 font-bold "> -1 </p> </div>
                <div className={`lvlg-map-feature ${findCurZone(curActID, curZoneID).hasRecipe? 'enabled': 'disabled'}`}> <img className="w-full h-full" src='resources/images/waypoint.png' /> </div>
                <div className={`lvlg-map-feature ${findCurZone(curActID, curZoneID).hastrial? 'enabled': 'disabled'}`}> <img className="w-full h-full" src='resources/images/portal.png' /> </div>
                <div className={`lvlg-map-feature ${findCurZone(curActID, curZoneID).hastrial? 'enabled': 'disabled'}`}> <img className="w-full h-full" src='resources/images/Offering_to_the_Goddess.png' /> </div>
                <div className={`lvlg-map-feature ${findCurZone(curActID, curZoneID).haspassive? 'enabled': 'disabled'}`}> <img className="w-full h-full" src='resources/images/logout.png' /> </div>
            </div>
        </div>
        <div>{findCurZone(curActID, curZoneID).note}</div>
        </div>
    )
}

export function ZoneTips(){

    return (
        <div>
            <h2>Tips</h2>

            <ul className="tips text-sm mt-2">
                <li>
				Logging out to the Character Selection screen and back in is a great way to go back to town for free (risky for the first hour of the league)
			</li><li>
				You don't need to talk to NPCs to get quests
			</li><li>
				One Man tag: Hit boss with everyone not in instance, port in, easy 1 man boss
			</li><li>
				Flesh and stone blinds mobs
			</li><li>
				Skitter bots slow mobs and shock(15%damage)
			</li><li>
				Leaving Izaro lieutenants alive gives you more keys at the end
			</li><li>
				At levl 50 and over, do all vaal side areas for 6-links, you can change colors in crafting bench
			</li><li>
				Don't obsess over every drop, prioritize sockets and links
			</li><li>
				7 vaal gems + sacrifice fragment = Vaal orb, with Vaal Orbs you can vaal your skills
			</li><li>
				Molten shell is a very good skill to vaal for Hardcore
			</li><li>
				Essences are good for easy leveling crafting
			</li><li>
				Sell to the vendor a Rustic Sash (magic or rare) + Blacksmith Whetstone + weapon = Magic same weapon type with (40 to 64%) Increased Physical Damage
			</li><li>
				Sell to the vendor a Chain Belt (magix or rare) + Blacksmith Whetstone + Dagger/Sceptre/Staff/Wand = Magic  same weapon with (10 to 29%) Increased Spell Damage
			</li><li>
				Sell to a vendor Magic Sceptre/Wand/Rune Dagger + Ruby Ring(for Fire Damage) or Topaz Ring(for Lightning Damage) or Sapphire Ring(for Cold Damage) + Orb of Alteration = Weapon with with added x to x Lightning/Fire/Cold Damage to Spells
			</li><li>
				Sell to a vendor White Boots + Any rarity Quicksilver Flask + Orb of Augmentation = Magic Boots with 10% increased Movement Speed
			</li><li>
				Sell to a vendor Magic or Rare Boots with +X% Movement Speed + Any rarity Quicksilver Flask + Orb of Augmentation = Magic Boots with (original value)+5% increased Movement Speed
			</li></ul>
        </div>
    )
}


export function LevelTips(props : any){

    const [levelTips, setlevelTips] = useState(  )

    return(
        <div>
            choses a faire en fonction du level
        </div>
    )

}