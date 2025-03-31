'use client'
import React from 'react'
import { useParams } from 'next/navigation'
import {useForm} from 'react-hook-form'
import { Button } from '@/components/ui/button'
import axios from 'axios'
import { useEffect } from 'react'
import { useState } from 'react'
import { log } from 'node:console'
const page = () => {
  const { username } = useParams() as { username: string }
  const { register, handleSubmit,setValue, formState: { errors } } = useForm({
    defaultValues: {
      message: ''
    }
  })
  function onSubmit(data: any) {
    console.log(data)
    setValue('message', '')
    
  }
  const [suggestedMessages, setSuggestedMessages] = useState<string[]>([])
  const [importNewMessages, setImportNewMessages] = useState(true)
  useEffect(() => {
    if (!importNewMessages) return; 
  
    const fetchMessages = async () => {
      try {
        const response = await axios.get('/api/suggest-messages');
        const messages = response.data.split('||');
        setSuggestedMessages(messages);
        console.log(messages);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setImportNewMessages(false); 
      }
    };
  
    fetchMessages();
  }, [importNewMessages]);

  
  return (
    <div>
      <div className='flex flex-col items-center mt-20'>
        <h1 className='font-sans font-bold text-5xl flex'>Public profile page</h1>
      </div>
      <div className='flex flex-col mt-10 mx-28 font-semibold text-2xl'>
        <div className='self-start mb-2'>
        <h2 >Send Anonymous message to @{username}</h2>
        </div>
        <div>
          <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
            <textarea {...register('message', { required: true })} className='border-2 border-gray-300 rounded-md p-2 w-full h-40 resize-none text-xl' placeholder='Type your message here...' />
            {errors.message && <span className='text-red-500'>This field is required</span>}
            <Button type='submit' className='h-12 w-28 text-xl self-center'>Send</Button>
          </form>
        </div>
        <div className='mt-24'>
          <Button className='h-12  text-xl self-center' >
            <div className='flex gap-2 font-normal text-lg' onClick={() => setImportNewMessages(true)}>
              <span>Suggest messages</span>
            </div>
          </Button>
        </div>
        <div className='mt-8 font-normal'>
          <p>Click on any message below to see it</p>
        </div>
        <div className="border border-gray-300 p-6 rounded-lg mt-6 shadow-md bg-white mb-6">
  <div className="flex flex-col gap-3 items-center">
    {suggestedMessages.map((message, index) => (
      <div
        onClick={() => setValue('message', message)}
        key={message}
        className="bg-gray-100 p-4 w-full rounded-lg cursor-pointer transition-transform duration-200 ease-in-out hover:bg-gray-200 hover:scale-105 shadow-sm"
      >
        <p className="text-base text-gray-800 leading-relaxed">{message}</p>
      </div>
    ))}
  </div>
</div>

      </div>
    </div>
  )
}

export default page