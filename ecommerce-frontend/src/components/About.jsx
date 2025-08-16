import React from 'react'
import { Link }  from 'react-router-dom'

export default function About() {



    return (
        <div className="">
          <div className="bg-gray-300 text-bold py-24">
              <div>
                <h1 className='bg-gray-300 text-center max-w-7xl text-3xl font-bold  px-4 mx-20'>About Us</h1>
              </div>
          </div>
         <div className='text-left max-w-4xl  py-28 ml-auto '>
           <p className='max-w-4xl px-28 text-gray-700'> At E-shop, we make shopping simple. 
               From reliable electrical goods to adorable baby essentials, 
               we bring quality, value, and convenience together in one place — 
               so you can find what you need, when you need it.
            </p>
         </div>
                  <div className='text-center mx-auto py-28 '>
           <p className='max-w-4xl mx-auto'>
            </p>
         </div>

        </div>
    )
}

