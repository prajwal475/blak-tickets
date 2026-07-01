// The marketing landing page — all homepage sections in order.
import Hero from './hero/Hero'
import Explore from './sections/Explore'
import FindNearYou from './sections/FindNearYou'
import Featured from './sections/Featured'
import WhyBlak from './sections/WhyBlak'
import UpcomingWeek from './sections/UpcomingWeek'
import TrustedBy from './sections/TrustedBy'

export default function Home() {
  return (
    <>
      <Hero />
      <Explore />
      <FindNearYou />
      <Featured />
      <WhyBlak />
      <UpcomingWeek />
      <TrustedBy />
    </>
  )
}
