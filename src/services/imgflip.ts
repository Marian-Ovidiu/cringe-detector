const IMGFLIP_ENDPOINT = 'https://api.imgflip.com/get_memes'

export interface ImgflipTemplate {
  id: string
  name: string
  url: string
  width: number
  height: number
}

interface ImgflipTemplateResponse {
  success: boolean
  data?: {
    memes?: Array<{
      id: string
      name: string
      url: string
      width: number
      height: number
    }>
  }
}

let templateCache: ImgflipTemplate[] | null = null
let inFlightRequest: Promise<ImgflipTemplate[]> | null = null

function normalizeTemplates(payload: ImgflipTemplateResponse): ImgflipTemplate[] {
  const rawTemplates = payload.data?.memes
  if (!payload.success || !Array.isArray(rawTemplates)) {
    return []
  }

  return rawTemplates
    .filter(
      (item) =>
        typeof item.id === 'string' &&
        typeof item.name === 'string' &&
        typeof item.url === 'string' &&
        typeof item.width === 'number' &&
        typeof item.height === 'number',
    )
    .map((item) => ({
      id: item.id,
      name: item.name,
      url: item.url,
      width: item.width,
      height: item.height,
    }))
}

export async function fetchImgflipTemplates(): Promise<ImgflipTemplate[]> {
  if (templateCache) {
    return templateCache
  }

  if (inFlightRequest) {
    return inFlightRequest
  }

  inFlightRequest = fetch(IMGFLIP_ENDPOINT)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Imgflip request failed with status ${response.status}`)
      }
      return response.json() as Promise<ImgflipTemplateResponse>
    })
    .then((payload) => {
      const templates = normalizeTemplates(payload)
      templateCache = templates
      return templates
    })
    .catch(() => [])
    .finally(() => {
      inFlightRequest = null
    })

  return inFlightRequest
}
