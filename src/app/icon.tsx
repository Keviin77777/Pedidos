import { ImageResponse } from 'next/og'
 
// Route segment config
export const runtime = 'edge'
 
// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'
 
// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 24,
          background: '#0F0F23',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}
      >
        <div style={{
          position: 'relative',
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {/* Golden ring */}
          <div style={{
            position: 'absolute',
            width: '24px',
            height: '24px',
            border: '2px solid #FCD34D',
            borderRadius: '50%',
            top: '0',
            left: '0',
          }} />
          
          {/* Character head */}
          <div style={{
            position: 'absolute',
            width: '8px',
            height: '8px',
            background: '#F3F4F6',
            borderRadius: '50%',
            top: '2px',
            left: '8px',
          }} />
          
          {/* Purple mask */}
          <div style={{
            position: 'absolute',
            width: '6px',
            height: '4px',
            background: '#8B5CF6',
            borderRadius: '50%',
            top: '4px',
            left: '9px',
          }} />
          
          {/* Eyes */}
          <div style={{
            position: 'absolute',
            width: '1px',
            height: '2px',
            background: '#FCD34D',
            top: '5px',
            left: '10px',
          }} />
          <div style={{
            position: 'absolute',
            width: '1px',
            height: '2px',
            background: '#FCD34D',
            top: '5px',
            left: '12px',
          }} />
          
          {/* Body */}
          <div style={{
            position: 'absolute',
            width: '6px',
            height: '8px',
            background: '#F3F4F6',
            borderRadius: '50%',
            top: '10px',
            left: '9px',
          }} />
          
          {/* Play button */}
          <div style={{
            position: 'absolute',
            width: '4px',
            height: '4px',
            background: '#8B5CF6',
            borderRadius: '50%',
            top: '12px',
            left: '10px',
          }} />
          <div style={{
            position: 'absolute',
            width: '0',
            height: '0',
            borderLeft: '2px solid #FCD34D',
            borderTop: '1px solid transparent',
            borderBottom: '1px solid transparent',
            top: '13px',
            left: '11px',
          }} />
        </div>
      </div>
    ),
    // ImageResponse options
    {
      // For convenience, we can re-use the exported icons size metadata
      // config to also set the ImageResponse's width and height.
      ...size,
    }
  )
} 