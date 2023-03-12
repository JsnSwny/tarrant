from django.shortcuts import render
from .dialogue_manager import some_model
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from .DialogManager import DialogManager
import json

DM = DialogManager()

DM.new_conversation(1)

#Hard coded start to question
print(["question"])
#This should make the model print options
print(DM.process_line(1, "S", "question"))

@csrf_exempt
def get_action(request):
    if request.method == 'POST':
        print("OKKKKKKK")
        print(DM)
        json_data = json.loads(request.body)
        try:
            user_input = json_data['input']
            print("USER POST")
            print(user_input)
            user = user_input.split(" ")[0]
            intent = user_input.split(" ")[1]
            print(user)
            print(intent)
        except KeyError:
            return JsonResponse({'error': 'Invalid input'})

        action = some_model(user_input)
        action = DM.process_line(1, user, intent)
        action = {
            "action": action[0]
        }
        print("ACTION")
        print(action)
        return JsonResponse(action)
    else:
        return JsonResponse({'error': 'Invalid request method'})
