import { NextRequest, NextResponse } from 'next/server';

/**
 * Public REST API: POST /api/v1/calculate/balthazard
 * Balthazard Özür Oranı Hesaplama API Endpoint'i
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawRates = body.rates || body.oranlar;

    if (!Array.isArray(rawRates) || rawRates.length === 0) {
      return NextResponse.json({
        status: 'error',
        message: 'Lütfen geçerli bir oran listesi girin (Örn: { "rates": [40, 20, 10] })'
      }, { status: 400 });
    }

    // Filter and sanitize numbers between 1 and 100
    const rates: number[] = rawRates
      .map(r => typeof r === 'string' ? parseFloat(r) : Number(r))
      .filter(r => !isNaN(r) && r > 0 && r <= 100)
      .sort((a, b) => b - a); // Balthazard requires descending order

    if (rates.length === 0) {
      return NextResponse.json({
        status: 'error',
        message: 'En az bir adet 1-100 arası geçerli oran girmelisiniz.'
      }, { status: 400 });
    }

    if (rates.length === 1) {
      const single = rates[0];
      return NextResponse.json({
        status: 'success',
        result: {
          total_rate: single,
          rounded_rate: Math.round(single),
          steps: [{ step: 1, rate: single, running_total: single }],
          qualifies_for_disability_card: single >= 40,
          qualifies_for_tax_discount: single >= 40,
          qualifies_for_90_percent_otv: single >= 90,
          formula: 'Tek engel oranı doğrudan geçerlidir.'
        }
      });
    }

    // Multi-rate Balthazard formula:
    // Step 1: Start with highest rate
    let total = rates[0];
    const steps = [
      { step: 1, added_rate: rates[0], remaining_capacity: 100 - rates[0], running_total: total }
    ];

    for (let i = 1; i < rates.length; i++) {
      const currentRate = rates[i];
      const remainingCapacity = 100 - total;
      const contribution = (currentRate * remainingCapacity) / 100;
      total = total + contribution;

      steps.push({
        step: i + 1,
        added_rate: currentRate,
        remaining_capacity: parseFloat(remainingCapacity.toFixed(2)),
        running_total: parseFloat(total.toFixed(2))
      });
    }

    const roundedRate = Math.round(total);

    return NextResponse.json({
      status: 'success',
      input_rates: rates,
      result: {
        total_rate: parseFloat(total.toFixed(2)),
        rounded_rate: roundedRate,
        formula: 'Balthazard Formülü: Total = A + B * (100 - A) / 100',
        steps,
        thresholds: {
          is_disabled_status_active: roundedRate >= 40,
          tax_discount_degree: roundedRate >= 80 ? '1. Derece (%80+)' : roundedRate >= 60 ? '2. Derece (%60-%79)' : roundedRate >= 40 ? '3. Derece (%40-%59)' : 'Yararlanamaz',
          qualifies_for_otv_exemption_90: roundedRate >= 90,
          early_retirement_eligible: roundedRate >= 40
        }
      },
      meta: {
        source: 'EngelsizForum Açık API v1',
        standard: 'Resmi Gazete Özürlülük Ölçütü ve Sağlık Kurulu Raporları Yönetmeliği'
      }
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, s-maxage=3600'
      }
    });

  } catch (err: any) {
    return NextResponse.json({
      status: 'error',
      message: err.message || 'Hesaplama yapılırken bir hata oluştu.'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/v1/calculate/balthazard',
    method: 'POST',
    description: 'Balthazard formülü ile birden çok engel oranının birleştirilmiş sonucunu hesaplar.',
    example_request: {
      rates: [40, 20, 10]
    },
    example_response: {
      status: 'success',
      input_rates: [40, 20, 10],
      result: {
        total_rate: 56.8,
        rounded_rate: 57,
        formula: 'Balthazard Formülü: Total = A + B * (100 - A) / 100'
      }
    }
  }, {
    headers: { 'Access-Control-Allow-Origin': '*' }
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}
