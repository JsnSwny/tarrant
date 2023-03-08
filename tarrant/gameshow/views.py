from django.shortcuts import render
from .dialogue_manager import some_model
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json

@csrf_exempt
def get_action(request):
    if request.method == 'POST':
        json_data = json.loads(request.body)
        try:
            input = json_data['input']
        except KeyError:
            return JsonResponse({'error': 'Invalid input'})

        action = some_model(input)
        return JsonResponse(action)
    else:
        return JsonResponse({'error': 'Invalid request method'})
