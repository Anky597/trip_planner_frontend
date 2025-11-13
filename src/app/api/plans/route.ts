import { NextResponse } from "next/server";

export async function GET() {
  // Artificial delay so you can see the loading shimmer/animation clearly.
  // In real implementation, remove or reduce this.
  await new Promise((resolve) => setTimeout(resolve, 8000));

  const data = {
    base_city: "Bengaluru",
    plan_options: [
      {
        plan_id: "plan_a_city_explorer",
        sources: [
          {
            url: "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGELB5JrYC9b__mJpIbbilylJ0BdJZspjNoca5Jseylf-i0GqUSSr53Bmz9q7ygztOBXN-94QUHzlHtBPXWbQpOVJDkyZuo50imQ86STCahp18nqAHodp604VKhfwId0k6k2nwbuDju0raqzWDaKJrEo-OrA76gFE77WA==",
            title:
              "Top 16 Adventure Sports near Bangalore: Rock Climbing, Mountain Biking, Wildlife Safari & More - Avathi outdoors",
            used_for: "Go-Karting at Meco Kartopia",
          },
          {
            url: "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQE6ALC5Ii3jAJD1FXuFjhBJ5u5wfy0atvC4Zuc0a9eWLtpQEUloxrhtA561bMWwlx_We7jN_svnuhiUdIhP108cfsdJkvfCkD3FDOJbBGmxosWn-Mn7RW8zao_GbpuN6SSCGbFVXd8OhMiAIujyIyJO4pljopTBLpifxuPr",
            title:
              "Bangalore Palace | Bangalore - What to Expect | Timings | Tips - Trip Ideas by MakeMyTrip",
            used_for: "Bangalore Palace Exploration",
          },
          {
            url: "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGAdv6mbKERybrQZDHU597XzvddlxT3gzofhknsxGoVP5RCSsKWxZCjtJ88v312zCIBJALLoCHXBDoO3nYp8_ifMaoaoGZpVvb6XWi-5yS9bbCrEsVMvCEwNSmizAH2rPhNqH6JFLbzQtrUWKZG0avDlzcIqE4rH6jufJ-B7d3Kqp0JscP9Z3tm65R-yEUYHLvxOID38UgV_X1lJ2zUrW6edWPhRftd_wMsRLGO8t11cGiOaIpJOAYNVaHptsUmeM=",
            title:
              "Bengaluru November Events 2025: Must-Visit Venues to Attend Concerts and Comedy Shows - Oneindia",
            used_for: "Calvin Harris India Debut Concert",
          },
          {
            url: "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHHtNoXtZno11j6z9zFskob0QASPz1xZjeTimBp2695DYCpG0YXDp3VJJuXXDcAyp5USGzq7jiDQO6AVj5eKenHNJM8J_TpLMPvPgZKJLL3PgHGVDKixPjAZb4VrTVS2y1YR6ByhhBxUSaVQRuvzy2ppghJm96tm3NGHi4FX0E25sjAxsCFxnUh2VdrM6zgeYp1X0AkzmwDUpcrELBIChY=",
            title:
              "Lalbagh Botanical Garden, Bangalore - Timings & Entryfee - My Holiday Happiness",
            used_for: "Lalbagh Botanical Garden Nature Walk",
          },
          {
            url: "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHfopP33jS5rSqVlA1-vtA0Zc8McGaR_GN9XBCv2ne9PqWLuXem3SiHNq2dJ80vl1x3mI0Tn96h0mimOAS1Cn5E1NzNCYw9qeivur4aNGap6xRkGSWSNpWwQo0ydlNZvhgIq4GsaBYJsk_wvRh8HYSwnsdJVg__DY0z6mbMXc0x_wMgLM8jX_jYflQXWjo9Dg==",
            title:
              "The National Gallery of Modern Art in Bangalore – A Must-visit - Karnataka.com",
            used_for: "National Gallery of Modern Art Visit",
          },
        ],
        schedule: [
          {
            day: 1,
            date: "2025-11-09",
            activities: [
              {
                time: "10:00 – 12:00",
                location: "Meco Kartopia, Hennur Bagalur Road, Bengaluru",
                description:
                  "Start the day with an adrenaline rush and social competition on a professional go-karting track.",
                activity_type: "Adventure/Fast Pace/Social",
                activity_title: "Go-Karting at Meco Kartopia",
              },
              {
                time: "12:00 – 13:30",
                location: "En route to Vasanth Nagar",
                description:
                  "Travel approx. 45-60 mins to the city center. Grab a quick lunch at a local restaurant near Bangalore Palace.",
                activity_type: "Transit/Meal",
                activity_title: "Travel & Lunch",
              },
              {
                time: "13:30 – 16:30",
                location: "Vasanth Nagar, Bengaluru",
                description:
                  "Immerse in the history and Tudor-style architecture of this majestic palace.",
                activity_type: "Cultural/Historical",
                activity_title: "Bangalore Palace Exploration",
              },
              {
                time: "16:30 – 18:30",
                location: "Near Embassy International Riding School",
                description:
                  "Travel approx. 1 hour to the concert venue area. Have dinner and get ready for the evening's event.",
                activity_type: "Transit/Meal",
                activity_title: "Travel & Pre-Concert Dinner",
              },
              {
                time: "19:00 – 22:00",
                location:
                  "Embassy International Riding School, Tarunhunse Village, Papanahalli, Bengaluru",
                description:
                  "Experience a high-energy EDM concert with pulsating beats in a large social gathering.",
                activity_type: "Social/Event/Fast Pace (Music)",
                activity_title: "Calvin Harris India Debut Concert",
              },
            ],
          },
          {
            day: 2,
            date: "2025-11-10",
            activities: [
              {
                time: "07:00 – 10:00",
                location: "Lalbagh Road, Mavalli, Bengaluru",
                description:
                  "Enjoy a refreshing and peaceful morning walk amidst 240 acres of lush greenery and rare plants.",
                activity_type: "Nature/Exploration",
                activity_title: "Lalbagh Botanical Garden Nature Walk",
              },
              {
                time: "10:00 – 11:00",
                location: "En route to Palace Road",
                description:
                  "Travel approx. 20-30 mins. Stop for a traditional South Indian breakfast.",
                activity_type: "Transit/Meal",
                activity_title: "Travel & Breakfast",
              },
              {
                time: "11:00 – 14:00",
                location:
                  "49 Palace Road, Manikyavelu Mansion, Bengaluru",
                description:
                  "Explore a rich collection of Indian art from the 18th century to contemporary works in a heritage mansion.",
                activity_type: "Cultural/Art",
                activity_title: "National Gallery of Modern Art Visit",
              },
            ],
          },
        ],
        plan_type: "in_city",
        plan_variant: "Plan A – City Explorer",
        why_fit_user:
          "This fast-paced plan is packed with adventure, social events, nature, and culture, perfectly matching the 'Adventurous Social Nature Explorer' persona's high energy and diverse interests.",
      },
      {
        plan_id: "plan_b_short_getaway",
        sources: [
          {
            url: "https://www.holidify.com/collections/places-to-visit-near-bangalore-within-150-kms",
            title:
              "Places to Visit Near Bangalore Within 150 Kms – Best Short Getaways for Every Traveller",
            used_for: "Ramanagara Destination Details",
          },
        ],
        schedule: [
          {
            day: 1,
            date: "2025-11-09",
            activities: [
              {
                time: "08:00 – 09:30",
                location: "Bengaluru to Ramanagara",
                description:
                  "Drive 1.5 hours (60 km) to the adventure hub of Ramanagara.",
                activity_type: "Transit",
                activity_title: "Travel to Ramanagara",
              },
              {
                time: "10:00 – 13:00",
                location: "Granite Hills of Ramanagara",
                description:
                  "Engage in thrilling rock climbing and rappelling on the dramatic granite hills, famously known as the setting for the movie 'Sholay'.",
                activity_type: "Adventure",
                activity_title: "Rock Climbing & Rappelling",
              },
              {
                time: "13:00 – 14:00",
                location:
                  "Local eatery or adventure camp in Ramanagara",
                description:
                  "Refuel with a local meal after the morning's adventure.",
                activity_type: "Meal",
                activity_title: "Lunch",
              },
              {
                time: "14:30 – 17:00",
                location: "Janapada Loka, Ramanagara",
                description:
                  "Experience rural charm and discover Karnataka's folk art and culture at this unique museum.",
                activity_type: "Culture",
                activity_title: "Explore Janapada Loka",
              },
              {
                time: "17:00 – onwards",
                location:
                  "Adventure camp or homestay in Ramanagara",
                description:
                  "Check into a non-luxury adventure camp or homestay, aligning with the user's preference to avoid luxury accommodation.",
                activity_type: "Accommodation",
                activity_title: "Check-in & Relax",
              },
            ],
          },
          {
            day: 2,
            date: "2025-11-10",
            activities: [
              {
                time: "07:30 – 11:30",
                location:
                  "Rugged terrain around Ramanagara",
                description:
                  "Undertake a challenging and rewarding trek through the rugged terrain, enjoying panoramic views.",
                activity_type: "Adventure/Nature",
                activity_title: "Trekking Expedition",
              },
              {
                time: "12:00 – 13:00",
                location: "Ramanagara",
                description:
                  "Have a final meal in Ramanagara before preparing for departure.",
                activity_type: "Meal/Accommodation",
                activity_title: "Lunch & Check-out",
              },
              {
                time: "13:30 – 15:00",
                location: "Ramanagara to Bengaluru",
                description:
                  "Drive 1.5 hours back to the base city.",
                activity_type: "Transit",
                activity_title: "Return to Bengaluru",
              },
            ],
          },
        ],
        plan_type: "short_trip",
        plan_variant: "Plan B – Short Getaway to Ramanagara",
        why_fit_user:
          "This itinerary focuses entirely on Ramanagara, an adventurer's paradise, directly catering to the user's primary 'Adventure Seeking' and 'Nature Affinity' traits with activities like rock climbing and trekking.",
      },
      {
        plan_id: "plan_c_hybrid",
        sources: [
          {
            url: "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGELB5JrYC9b__mJpIbbilylJ0BdJZspjNoca5Jseylf-i0GqUSSr53Bmz9q7ygztOBXN-94QUHzlHtBPXWbQpOVJDkyZuo50imQ86STCahp18nqAHodp604VKhfwId0k6k2nwbuDju0raqzWDaKJrEo-OrA76gFE77WA==",
            title:
              "Top 16 Adventure Sports near Bangalore: Rock Climbing, Mountain Biking, Wildlife Safari & More - Avathi outdoors",
            used_for: "Go-Karting at Meco Kartopia",
          },
          {
            url: "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQE6ALC5Ii3jAJD1FXuFjhBJ5u5wfy0atvC4Zuc0a9eWLtpQEUloxrhtA561bMWwlx_We7jN_svnuhiUdIhP108cfsdJkvfCkD3FDOJbBGmxosWn-Mn7RW8zao_GbpuN6SSCGbFVXd8OhMiAIujyIyJO4pljopTBLpifxuPr",
            title:
              "Bangalore Palace | Bangalore - What to Expect | Timings | Tips - Trip Ideas by MakeMyTrip",
            used_for: "Bangalore Palace Exploration",
          },
          {
            url: "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGAdv6mbKERybrQZDHU597XzvddlxT3gzofhknsxGoVP5RCSsKWxZCjtJ88v312zCIBJALLoCHXBDoO3nYp8_ifMaoaoGZpVvb6XWi-5yS9bbCrEsVMvCEwNSmizAH2rPhNqH6JFLbzQtrUWKZG0avDlzcIqE4rH6jufJ-B7d3Kqp0JscP9Z3tm65R-yEUYHLvxOID38UgV_X1lJ2zUrW6edWPhRftd_wMsRLGO8t11cGiOaIpJOAYNVaHptsUmeM=",
            title:
              "Bengaluru November Events 2025: Must-Visit Venues to Attend Concerts and Comedy Shows - Oneindia",
            used_for: "Calvin Harris India Debut Concert",
          },
          {
            url: "https://www.holidify.com/collections/places-to-visit-near-bangalore-within-150-kms",
            title:
              "Places to Visit Near Bangalore Within 150 Kms – Best Short Getaways for Every Traveller",
            used_for: "Ramanagara Destination Details",
          },
        ],
        schedule: [
          {
            day: 1,
            date: "2025-11-09",
            activities: [
              {
                time: "10:00 – 12:00",
                location: "Meco Kartopia, Hennur Bagalur Road, Bengaluru",
                description:
                  "Kick off the trip with a high-speed, competitive adventure.",
                activity_type: "Adventure/Fast Pace/Social",
                activity_title: "Go-Karting at Meco Kartopia",
              },
              {
                time: "12:00 – 13:30",
                location: "En route to Vasanth Nagar",
                description:
                  "Travel approx. 45-60 mins to the city center and have lunch.",
                activity_type: "Transit/Meal",
                activity_title: "Travel & Lunch",
              },
              {
                time: "13:30 – 16:30",
                location: "Vasanth Nagar, Bengaluru",
                description:
                  "Dive into the city's royal history and architecture.",
                activity_type: "Cultural/Historical",
                activity_title: "Bangalore Palace Exploration",
              },
              {
                time: "16:30 – 18:30",
                location: "Near Embassy International Riding School",
                description:
                  "Travel approx. 1 hour to the concert venue area and have dinner.",
                activity_type: "Transit/Meal",
                activity_title: "Travel & Pre-Concert Dinner",
              },
              {
                time: "19:00 – 22:00",
                location:
                  "Embassy International Riding School, Tarunhunse Village, Papanahalli, Bengaluru",
                description:
                  "End the day with a massive social event and high-energy music.",
                activity_type: "Social/Event/Fast Pace (Music)",
                activity_title: "Calvin Harris India Debut Concert",
              },
            ],
          },
          {
            day: 2,
            date: "2025-11-10",
            activities: [
              {
                time: "08:00 – 09:30",
                location: "Bengaluru to Ramanagara",
                description:
                  "Take a 1.5-hour drive for a day trip to the rocky hills of Ramanagara.",
                activity_type: "Transit",
                activity_title: "Travel to Ramanagara",
              },
              {
                time: "09:30 – 13:30",
                location: "Granite Hills of Ramanagara",
                description:
                  "Engage in a thrilling rock climbing and rappelling session on the famous granite outcrops.",
                activity_type: "Adventure/Nature",
                activity_title: "Rock Climbing Adventure",
              },
              {
                time: "13:30 – 14:30",
                location: "Local restaurant in Ramanagara",
                description:
                  "Enjoy a local meal with views of the dramatic landscape.",
                activity_type: "Meal",
                activity_title: "Lunch in Ramanagara",
              },
              {
                time: "14:30 – 16:00",
                location: "Ramanagara to Bengaluru",
                description:
                  "Drive back to the city after an adventurous day.",
                activity_type: "Transit",
                activity_title: "Return to Bengaluru",
              },
            ],
          },
        ],
        plan_type: "hybrid_city_and_trip",
        plan_variant: "Plan C – Hybrid Adventure",
        why_fit_user:
          "This hybrid plan combines a fast-paced day of social and cultural events in the city with a focused day trip for pure adventure, satisfying the user's desire for both urban energy and thrilling nature experiences.",
      },
    ],
  };

  return NextResponse.json(data);
}
