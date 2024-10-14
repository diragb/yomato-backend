// Packages:
import axios from 'axios'
import logError from '../utils/logError'
import * as cheerio from 'cheerio'
import returnable from '../utils/returnable'

// Typescript:
import type { Request, Response } from 'express'
import type { APIResponse, Returnable } from '../types'
import type {
  Food,
  SubSection,
  Section,
  Restaurant,
} from '../types/menu'

// Functions:
const scrapeRestaurantWebsite = async (url: string): Promise<Returnable<Restaurant, Error>> => {
  try {
    const { data: html, status } = await axios.get(
      url,
      {
        validateStatus: status => status < 500,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'
        }
      }
    )
    console.log(status)
    if (status >= 400) throw new Error('Restaurant does not exist!')
    const $ = cheerio.load(html)

    const scriptTag = $('body > script:nth-of-type(1)')
    let scriptContent = $(scriptTag).first().text()

    if (!scriptContent.includes('window.__PRELOADED_STATE__')) return returnable.fail(new Error('Zomato has changed how it handles preloaded state for menu items'))

    scriptContent = scriptContent.trim()
    scriptContent = scriptContent.slice(40).slice(0, -2)
    const data = JSON.parse(JSON.parse(scriptContent))
    if (!data) return returnable.fail(new Error('Zomato has changed how it handles preloaded state for menu items'))

    const restaurantID = Object.keys(data?.pages?.restaurant)?.[0]
    if (!restaurantID) return returnable.fail(new Error('No Restaurant ID found!'))

    let menu: Section[] | null = null
    if (data.pages.restaurant?.[restaurantID]?.order) {
      menu = data.pages.restaurant?.[restaurantID]?.order?.menuList?.menus?.map((_menu: any) => {
        return {
          title: _menu.menu.name,
          subSections: _menu.menu.categories.map((category: any) => {
            return {
              title: category.category.name,
              foods: category.category.items.map((item: any) => {
                return {
                  name: item.item.name || '',
                  description: item.item.desc || '',
                  type: item.item.dietary_slugs?.[0] ?? 'non-veg',
                  image: item.item.item_image_url || null,
                  thumbnail: item.item.item_image_thumb_url || null,
                  price: item.item.display_price ?? 0,
                  rating: {
                    votes: parseInt(item.item.rating?.total_rating_text) ?? 0,
                    value: item.item.rating?.value ?? 0,
                  },
                } as Food
              }) as Food[]
            } as SubSection
          }) as SubSection[]
        } as Section
      }) as Section[]
    }

    return returnable.success({
      name: data.pages.restaurant?.[restaurantID]?.sections?.SECTION_BASIC_INFO?.name ?? '',
      address: data.pages.restaurant?.[restaurantID]?.sections?.SECTION_RES_CONTACT?.address ?? '',
      image: data.pages.restaurant?.[restaurantID]?.sections?.SECTION_BASIC_INFO?.res_thumb || null,
      menu,
      rating: {
        value: parseFloat(data.pages.restaurant?.[restaurantID]?.sections?.SECTION_BASIC_INFO?.rating?.aggregate_rating || 0),
        votes: parseFloat(data.pages.restaurant?.[restaurantID]?.sections?.SECTION_BASIC_INFO?.rating?.votes || 0),
        color: data.pages.restaurant?.[restaurantID]?.sections?.SECTION_BASIC_INFO?.rating?.rating_color || null,
      },
      url: data.pages.restaurant?.[restaurantID].navbarSection[0].canonicalUrl,
    })
  } catch (error) {
    logError({
      functionName: 'scrapeRestaurantWebsite',
      data: url,
      error: error as unknown as Error,
    })

    return returnable.fail(error as unknown as Error)
  }
}

const getRestaurant = async (
  req: Request<{}, any, any, Record<string, any>>,
  res: Response<any, Record<string, any>>
) => {
  try {
    let { city, restaurant } = req.query as {
      city?: string
      restaurant?: string
    }

    if (
      !city ||
      !restaurant
    ) {
      const errorResponse: APIResponse<null> = {
        status: 'error',
        message: 'Invalid or missing url parameter',
      }

      res.status(200).json(errorResponse)
      return
    }

    const ORDER_ONLINE_URL = `https://www.zomato.com/${ city }/${ restaurant }/order`
    const {
      payload,
      status,
    } = await scrapeRestaurantWebsite(ORDER_ONLINE_URL)

    if (!status) throw payload

    const successResponse: APIResponse<any> = {
      status: 'success',
      message: 'Restaurant menu fetched successfully',
      data: payload,
    }
    res.status(200).json(successResponse)
  } catch (error) {
    logError({
      functionName: 'getRestaurant',
      data: req.query,
      error: error as unknown as Error,
    })

    if (
      [
        'Restaurant does not exist!',
        'No Restaurant ID found!'
      ].includes((error as unknown as Error).message)
    ) {
      const errorResponse: APIResponse<null> = {
        status: 'error',
        message: (error as unknown as Error).message || 'Something went wrong, please try again later!',
      }
  
      res.status(200).json(errorResponse)
    } else {
      const errorResponse: APIResponse<null> = {
        status: 'error',
        message: (error as unknown as Error).message || 'Something went wrong, please try again later!',
      }
  
      res.status(200).json(errorResponse)
    }
  }
}

// Exports:
export default getRestaurant
