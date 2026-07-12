import {
    useCallback,
    useEffect,
    useRef,
    useState
} from "react";


import {
    Link,
    useLocation
} from "react-router-dom";


import {

    BoxCubeIcon,
    CalenderIcon,
    ChevronDownIcon,
    GridIcon,
    HorizontaLDots,
    ListIcon,
    PageIcon,
    PieChartIcon,
    PlugInIcon,
    TableIcon,
    UserCircleIcon,

} from "../icons";


import {
    useSidebar
} from "../context/SidebarContext";


import SidebarWidget from "../components/SidebarWidget";
import useAuth from "../hooks/useAuth";



const employeeNavItems = [

    {
        icon:<GridIcon/>,
        name:"Dashboard",
        path:"/dashboard"
    },


    {
        icon:<CalenderIcon/>,
        name:"Absensi",
        path:"/attendance"
    },


    {
        icon:<TableIcon/>,
        name:"Approvals",
        path:"/approvals"
    },


    {
        icon:<UserCircleIcon/>,
        name:"Profile",
        path:"/profile"
    },

];




// ===============================
// MENU LAIN
// ===============================

const adminOthersItems = [

    {
        icon:<PieChartIcon/>,
        name:"Laporan",
        subItems:[

            {
                name:"Rekap Absensi",
                path:"/reports"
            }

        ]
    },


    {
        icon:<ListIcon/>,
        name:"Employees",
        subItems:[

            {
                name:"Manajemen Karyawan",
                path:"/employees"
            }

        ]
    },


    {
        icon:<PlugInIcon/>,
        name:"Pengaturan",
        subItems:[

            {
                name:"Account",
                path:"/settings"
            }

        ]
    }

];

const employeeOthersItems = [

    {
        icon:<PlugInIcon/>,
        name:"Pengaturan",
        subItems:[

            {
                name:"Account",
                path:"/settings"
            }

        ]
    }

];





export default function AppSidebar(){

    const { user } = useAuth();

    // Robust role resolution:
    // - normal case: user.role
    // - edge case: some auth flows may wrap user object differently
    // - fallback: read last stored user from localStorage
    const storedUser = (() => {
        try {
            const raw = localStorage.getItem("user");
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    })();

    const resolvedRole =
        user?.role ??
        user?.user?.role ??
        storedUser?.role ??
        storedUser?.user?.role ??
        "";

    const role = String(resolvedRole).toLowerCase();
    const isAdmin = role === "admin";

    // NOTE:
    // Menu Employees dirender hanya saat isAdmin = true.
    // Perbaikan ini menambah fallback role dari localStorage agar tidak gagal
    // bila struktur user di AuthContext berbeda antar flow.

    const {

        isExpanded,
        isMobileOpen,
        isHovered,
        setIsHovered

    } = useSidebar();



    const location = useLocation();



    const [
        openSubmenu,
        setOpenSubmenu

    ] = useState(null);



    const [
        subMenuHeight,
        setSubMenuHeight

    ] = useState({});



    const subMenuRefs = useRef({});






    // ===============================
    // ACTIVE MENU
    // ===============================


    const isActive = useCallback(

        (path)=>{

            return location.pathname === path;

        },

        [
            location.pathname
        ]

    );





    // ===============================
    // CHECK ACTIVE SUBMENU
    // ===============================


    useEffect(()=>{


        let submenuMatched=false;


        [
            {
                type:"main",
                items:navItems
            },

            {
                type:"others",
                items:othersItems
            }


        ].forEach(menu=>{


            menu.items.forEach((nav,index)=>{


                if(nav.subItems){


                    nav.subItems.forEach(item=>{


                        if(isActive(item.path)){


                            setOpenSubmenu({

                                type:menu.type,

                                index:index

                            });



                            submenuMatched=true;


                        }


                    });


                }



            });



        });



        if(!submenuMatched){

            setOpenSubmenu(null);

        }



    },[
        location,
        isActive
    ]);








    // ===============================
    // SUBMENU HEIGHT
    // ===============================


    useEffect(()=>{


        if(openSubmenu!==null){


            const key =
            `${openSubmenu.type}-${openSubmenu.index}`;



            if(subMenuRefs.current[key]){


                setSubMenuHeight(prev=>({

                    ...prev,


                    [key]:
                    subMenuRefs.current[key]
                    .scrollHeight || 0


                }));

            }


        }



    },[
        openSubmenu
    ]);








    const handleSubmenuToggle = (

        index,

        menuType

    )=>{


        setOpenSubmenu(prev=>{


            if(

                prev &&

                prev.type===menuType &&

                prev.index===index

            ){

                return null;

            }



            return {

                type:menuType,

                index:index

            };


        });



    };









    const renderMenuItems = (

        items,

        menuType

    )=>(


        <ul className="flex flex-col gap-4">


        {

            items.map((nav,index)=>(


                <li key={nav.name}>


                {

                    nav.subItems ? (


                    <button

                    onClick={()=>handleSubmenuToggle(

                        index,

                        menuType

                    )}

                    className={`
                    menu-item group cursor-pointer

                    ${
                        openSubmenu?.type===menuType &&
                        openSubmenu?.index===index

                        ?

                        "menu-item-active"

                        :

                        "menu-item-inactive"

                    }


                    ${
                        !isExpanded &&
                        !isHovered

                        ?

                        "lg:justify-center"

                        :

                        "lg:justify-start"

                    }

                    `}

                    >



                    <span

                    className={`
                    menu-item-icon-size


                    ${
                    openSubmenu?.type===menuType &&
                    openSubmenu?.index===index

                    ?

                    "menu-item-icon-active"

                    :

                    "menu-item-icon-inactive"

                    }

                    `}

                    >

                    {nav.icon}

                    </span>





                    {

                    (
                    isExpanded ||
                    isHovered ||
                    isMobileOpen

                    )

                    &&

                    <span className="menu-item-text">

                    {nav.name}

                    </span>

                    }





                    {

                    (
                    isExpanded ||
                    isHovered ||
                    isMobileOpen

                    )

                    &&


                    <ChevronDownIcon

                    className={`
                    ml-auto
                    w-5
                    h-5
                    transition-transform


                    ${
                    openSubmenu?.type===menuType &&
                    openSubmenu?.index===index

                    ?

                    "rotate-180 text-brand-500"

                    :

                    ""

                    }

                    `}

                    />

                    }



                    </button>


                    )



                    :



                    (



                    <Link

                    to={nav.path}


                    className={`

                    menu-item group


                    ${
                    isActive(nav.path)

                    ?

                    "menu-item-active"

                    :

                    "menu-item-inactive"

                    }


                    `}


                    >


                    <span

                    className={`

                    menu-item-icon-size


                    ${
                    isActive(nav.path)

                    ?

                    "menu-item-icon-active"

                    :

                    "menu-item-icon-inactive"

                    }


                    `}

                    >

                    {nav.icon}

                    </span>





                    {

                    (
                    isExpanded ||
                    isHovered ||
                    isMobileOpen

                    )

                    &&


                    <span className="menu-item-text">

                    {nav.name}

                    </span>


                    }



                    </Link>



                    )

                }






                {


                nav.subItems &&

                (
                isExpanded ||
                isHovered ||
                isMobileOpen

                )

                &&



                <div

                ref={(el)=>{

                subMenuRefs.current[

                `${menuType}-${index}`

                ]=el;


                }}



                className="
                overflow-hidden
                transition-all
                duration-300
                "



                style={{

                    height:

                    openSubmenu?.type===menuType &&
                    openSubmenu?.index===index

                    ?

                    `${subMenuHeight[`${menuType}-${index}`]}px`

                    :

                    "0px"


                }}



                >



                <ul className="
                mt-2
                space-y-1
                ml-9
                ">


                {

                nav.subItems.map(item=>(


                    <li key={item.name}>


                    <Link

                    to={item.path}


                    className={`

                    menu-dropdown-item


                    ${
                    isActive(item.path)

                    ?

                    "menu-dropdown-item-active"

                    :

                    "menu-dropdown-item-inactive"

                    }


                    `}

                    >

                    {item.name}


                    </Link>



                    </li>



                ))



                }



                </ul>



                </div>



                }



                </li>



            ))


        }


        </ul>


    );










    return (


        <aside


        className={`

        fixed

        mt-16

        lg:mt-0

        top-0

        left-0

        px-5

        bg-white

        dark:bg-gray-900

        dark:border-gray-800

        text-gray-900

        h-screen

        transition-all

        duration-300

        z-50

        border-r

        border-gray-200



        ${

        isExpanded || isMobileOpen

        ?

        "w-[290px]"

        :

        isHovered

        ?

        "w-[290px]"

        :

        "w-[90px]"

        }



        ${

        isMobileOpen

        ?

        "translate-x-0"

        :

        "-translate-x-full"

        }



        lg:translate-x-0


        `}



        onMouseEnter={()=>{

            if(!isExpanded)

            setIsHovered(true)

        }}


        onMouseLeave={()=>{

            setIsHovered(false)

        }}



        >





        <div className="py-8">


            <Link to="/dashboard">


            <img

            src="/images/logo/logo.svg"

            alt="Mini HRIS"

            width="150"

            />


            </Link>


        </div>





        <nav className="
        overflow-y-auto
        "
        >


        <div className="
        flex
        flex-col
        gap-6
        ">


        <div>

        <h2 className="
        mb-4
        text-xs
        uppercase
        text-gray-400
        ">

        Menu

        </h2>


        {
            renderMenuItems(
                employeeNavItems,
                "main"
            )
        }
        {
            isAdmin && renderMenuItems(
                [{
                    icon:<ListIcon/>,
                    name:"Employees",
                    path:"/employees"
                }],
                "main"
            )
        }


        </div>





        <div>


        <h2 className="
        mb-4
        text-xs
        uppercase
        text-gray-400
        ">

        Others

        </h2>


        {
            renderMenuItems(
                isAdmin ? adminOthersItems : employeeOthersItems,
                "others"
            )
        }


        </div>




        </div>


        </nav>



        {

        isExpanded ||

        isHovered ||

        isMobileOpen

        ?

        <SidebarWidget/>

        :

        null

        }



        </aside>


    );

}